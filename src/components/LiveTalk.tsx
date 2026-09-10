import { handleLiveCodingIntent, subscribeToFileActionResults } from "../utils/liveCodingBridge";
import React, { useEffect, useRef, useState } from "react";
import { addConversationTurn } from "../utils/conversationState";
import { getWorkspacePromptContext } from "../utils/workspaceContext";

interface LiveTalkProps {
  onClose: () => void;
}

function float32ToPcm16(input: Float32Array): Int16Array {

const output = new Int16Array(input.length);

  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return output;
}

function downsample(input: Float32Array, inputRate: number, outputRate = 16000): Float32Array {
  if (inputRate === outputRate) return input;

  const ratio = inputRate / outputRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const position = i * ratio;
    const index = Math.floor(position);
    const fraction = position - index;

    const a = input[Math.min(index, input.length - 1)];
    const b = input[Math.min(index + 1, input.length - 1)];

    output[i] = a + (b - a) * fraction;
  }

  return output;
}

function int16ToFloat32(input: Int16Array): Float32Array {
  const output = new Float32Array(input.length);

  for (let i = 0; i < input.length; i++) {
    output[i] = input[i] / 32768;
  }

  return output;
}

function base64ToInt16(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Int16Array(bytes.buffer);
}

export default function LiveTalk({ onClose }: LiveTalkProps) {
  const [connected, setConnected] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const liveAssistantTranscriptRef = useRef("");
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startedRef = useRef(false);
  const speakingRef = useRef(false);

  const stopPlayback = () => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
      } catch {}
    }

    activeSourcesRef.current.clear();

    const ctx = playbackContextRef.current;
    if (ctx) {
      nextPlayTimeRef.current = ctx.currentTime;
    }

    setSpeaking(false);
    speakingRef.current = false;
  };

  const playPcmAudio = async (base64: string, mimeType?: string) => {
    try {
      if (!playbackContextRef.current) {
        playbackContextRef.current = new AudioContext();
      }

      const ctx = playbackContextRef.current;

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const pcm = base64ToInt16(base64);
      const samples = int16ToFloat32(pcm);

      const match = mimeType?.match(/rate=(\d+)/i);
      const sampleRate = match ? Number(match[1]) : 24000;

      const buffer = ctx.createBuffer(1, samples.length, sampleRate);
      buffer.copyToChannel(samples, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current);

      source.start(startTime);
      nextPlayTimeRef.current = startTime + buffer.duration;

      activeSourcesRef.current.add(source);

      setSpeaking(true);
      speakingRef.current = true;

      source.onended = () => {
        activeSourcesRef.current.delete(source);

        if (activeSourcesRef.current.size === 0) {
          setSpeaking(false);
          speakingRef.current = false;
        }
      };
    } catch (err) {
      console.error("Live Talk playback error:", err);
    }
  };

  const cleanup = () => {
    startedRef.current = false;

    stopPlayback();

    try {
      processorRef.current?.disconnect();
    } catch {}

    try {
      sourceRef.current?.disconnect();
    } catch {}

    processorRef.current = null;
    sourceRef.current = null;

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    try {
      audioContextRef.current?.close();
    } catch {}

    audioContextRef.current = null;

    try {
      playbackContextRef.current?.close();
    } catch {}

    playbackContextRef.current = null;

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    setConnected(false);
    emitCloudConnectState("idle");
    setListening(false);
  };

  const startLiveTalk = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }
    if (startedRef.current) return;

    setError("");
    setTranscript("");

    try {
      startedRef.current = true;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/live`);

      wsRef.current = ws;

      ws.onopen = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

          streamRef.current = stream;

          const audioContext = new AudioContext();
          audioContextRef.current = audioContext;

          if (audioContext.state === "suspended") {
            await audioContext.resume();
          }

          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);

          sourceRef.current = source;
          processorRef.current = processor;

          processor.onaudioprocess = (event) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
              return;
            }

            const input = event.inputBuffer.getChannelData(0);

            const downsampled = downsample(
              input,
              audioContext.sampleRate,
              16000
            );

            const pcm = float32ToPcm16(downsampled);

            let sum = 0;

            for (let i = 0; i < input.length; i++) {
              sum += input[i] * input[i];
            }

            const rms = Math.sqrt(sum / Math.max(1, input.length));

            if (speakingRef.current && rms > 0.035) {
              stopPlayback();
            }

            const bytes = new Uint8Array(pcm.buffer);
            let binary = "";

            const chunkSize = 0x8000;

            for (let i = 0; i < bytes.length; i += chunkSize) {
              binary += String.fromCharCode(
                ...bytes.subarray(i, Math.min(i + chunkSize, bytes.length))
              );
            }

            wsRef.current.send(
              JSON.stringify({
                type: "audio",
                audioBase64: btoa(binary),
                mimeType: "audio/pcm;rate=16000",
              })
            );
          };

          source.connect(processor);
          processor.connect(audioContext.destination);

          setConnected(true);
      emitCloudConnectState("voice");
          setListening(true);
    emitCloudConnectState("voice");
        } catch (err) {
          console.error("Microphone error:", err);
          setError("Microphone permission is required.");
          cleanup();
        }
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "ready") {
            return;
          }

          if (data.type === "audio" && data.audioBase64) {
            await playPcmAudio(data.audioBase64, data.mimeType);
            return;
          }

          if (data.type === "text" && data.text) {
        liveAssistantTranscriptRef.current +=
          (liveAssistantTranscriptRef.current ? " " : "") + data.text;
            setTranscript((previous) => {
              const next = `${previous}${previous ? " " : ""}${data.text}`;
              return next.slice(-1200);
            });
            return;
          }

          if (data.type === "interrupted") {
        nextPlayTimeRef.current = 0;

        activeSourcesRef.current.forEach((source) => {
          try {
            source.stop();
          } catch {}
        });

        activeSourcesRef.current.clear();
            stopPlayback();
            return;
          }

          if (data.type === "userTranscript" && data.text) {
              handleLiveCodingIntent(data.text);
            }

            if (data.type === "turnComplete") {
        const assistantTurn = liveAssistantTranscriptRef.current.trim();

        if (assistantTurn) {
          addConversationTurn("assistant", assistantTurn, "live");
          liveAssistantTranscriptRef.current = "";
        }
        emitCloudConnectState("voice");
            return;
          }

          if (data.type === "error") {
            setError(data.message || "Live Talk connection error.");
          }
        } catch (err) {
          console.error("Live Talk message error:", err);
        }
      };

      ws.onerror = () => {
        setError("Live Talk connection failed.");
      };

      ws.onclose = () => {
        if (startedRef.current) {
          cleanup();
        }
      };
    } catch (err) {
      console.error("Live Talk start error:", err);
      setError("Could not start Live Talk.");
      cleanup();
    }
  };


  const emitCloudConnectState = (
    state: "idle" | "thinking" | "voice" | "coding" | "error"
  ) => {
    window.dispatchEvent(
      new CustomEvent("cloudconnect-state-events", {
        detail: { state },
      })
    );
  };

  useEffect(() => {
    const unsubscribeFileActions = subscribeToFileActionResults((detail) => {
      const result = detail?.result;

      if (result?.success) {
        setTranscript((prev) =>
          `${prev}\nCloudConnect: ${result.message || "File action completed."}`.trim()
        );
      } else if (result) {
        setTranscript((prev) =>
          `${prev}\nCloudConnect: ${result.message || "File action failed."}`.trim()
        );
      }
    });


    const handleContextRequest = () => {
      window.dispatchEvent(
        new CustomEvent("cloudconnect-live-workspace-context", {
          detail: {
            context: getWorkspacePromptContext(),
          },
        })
      );
    };

    window.addEventListener(
      "cloudconnect-workspace-context-request",
      handleContextRequest
    );

    return () => {
      unsubscribeFileActions();

      window.removeEventListener(
        "cloudconnect-workspace-context-request",
        handleContextRequest
      );
    };
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, []);

  useEffect(() => {
    return () => {
      try {
        wsRef.current?.close();
      } catch {}

      if (processorRef.current) {
        try {
          processorRef.current.disconnect();
        } catch {}
      }

      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {}
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      activeSourcesRef.current.forEach((source) => {
        try {
          source.stop();
        } catch {}
      });

      activeSourcesRef.current.clear();
      emitCloudConnectState("idle");
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[min(92vw,520px)] rounded-3xl border border-white/10 bg-neutral-950 p-6 text-white shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">CloudConnect Live Talk</h2>
            <p className="mt-1 text-sm text-white/50">
              Natural continuous voice conversation
            </p>
          </div>

          <button
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="rounded-full px-3 py-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-[230px] flex-col items-center justify-center rounded-2xl bg-white/[0.04]">
          <div
            className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full border ${
              speaking
                ? "animate-pulse border-white/60 bg-white/15"
                : listening
                  ? "border-white/30 bg-white/10"
                  : "border-white/10 bg-white/5"
            }`}
          >
            <span className="text-4xl">
              {speaking ? "🔊" : listening ? "🎙️" : "🎧"}
            </span>
          </div>

          <div className="text-sm text-white/70">
            {!connected && "Ready"}
            {connected && listening && !speaking && "Listening..."}
            {connected && speaking && "CloudConnect is speaking..."}
          </div>

          {transcript && (
            <div className="mt-5 max-h-24 w-full overflow-auto px-5 text-center text-xs leading-5 text-white/45">
              {transcript}
            </div>
          )}

          {error && (
            <div className="mt-4 px-5 text-center text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {!connected ? (
            <button
              onClick={startLiveTalk}
              className="flex-1 rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:bg-white/90"
            >
              Start Live Talk
            </button>
          ) : (
            <button
              onClick={() => cleanup()}
              className="flex-1 rounded-xl bg-white/10 px-4 py-3 font-medium hover:bg-white/15"
            >
              End Live Talk
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-white/35">
          Speak naturally. You don't need to press send after every sentence.
        </p>
      </div>
    </div>
  );
}
