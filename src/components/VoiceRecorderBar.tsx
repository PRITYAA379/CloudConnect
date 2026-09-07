import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause, AlertCircle, Volume2 } from 'lucide-react';
import { VoiceRecorder } from '../utils/audio';
import { VoiceNoteData } from '../types';

interface VoiceRecorderBarProps {
  isRecording: boolean;
  onCancel: () => void;
  onSendVoiceNote: (voiceNote: VoiceNoteData) => void;
  voiceModeOnly?: boolean;
}

export const VoiceRecorderBar: React.FC<VoiceRecorderBarProps> = ({
  isRecording,
  onCancel,
  onSendVoiceNote,
  voiceModeOnly = false,
}) => {
  const [recordedData, setRecordedData] = useState<{
    blob: Blob;
    url: string;
    base64: string;
    duration: number;
    transcription?: string;
  } | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [recorderError, setRecorderError] = useState<string | null>(null);

  const recorderRef = useRef<VoiceRecorder | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isRecording && !recorderRef.current) {
      startRecordingSession();
    }

    return () => {
      if (recorderRef.current) {
        recorderRef.current.cancel();
        recorderRef.current = null;
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, [isRecording]);

  const startRecordingSession = async () => {
    setRecorderError(null);
    setRecordedData(null);
    setSeconds(0);
    setLiveTranscript('');

    const rec = new VoiceRecorder();
    recorderRef.current = rec;

    const started = await rec.start(
      (sec) => setSeconds(sec),
      (freqs) => setFrequencies(freqs),
      (text) => setLiveTranscript(text)
    );

    if (!started) {
      setRecorderError('Microphone permission denied or audio device not found.');
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    try {
      const data = await recorderRef.current.stop();
      recorderRef.current = null;
      setRecordedData(data);
      if (data.transcription) {
        setLiveTranscript(data.transcription);
      }
    } catch (err: any) {
      console.error('Stop recording error:', err);
      setRecorderError('Failed to capture audio.');
    }
  };

  const handleCancel = () => {
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setRecordedData(null);
    setLiveTranscript('');
    onCancel();
  };

  const handleSend = () => {
    if (!recordedData) return;
    onSendVoiceNote({
      audioBlobUrl: recordedData.url,
      audioBase64: recordedData.base64,
      mimeType: recordedData.blob.type || 'audio/webm',
      durationSeconds: recordedData.duration,
      transcription: recordedData.transcription || liveTranscript || undefined,
    });
    setRecordedData(null);
    setLiveTranscript('');
  };

  const togglePlayPreview = () => {
    if (!recordedData) return;
    if (!audioPreviewRef.current) {
      const a = new Audio(recordedData.url);
      a.onended = () => setIsPlayingPreview(false);
      audioPreviewRef.current = a;
    }

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isRecording && !recordedData) return null;

  return (
    <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-emerald-500/40 rounded-2xl p-4 shadow-xl mb-3 animate-in slide-in-from-bottom-2 duration-200">
      {recorderError ? (
        <div className="flex items-center justify-between gap-3 text-red-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{recorderError}</span>
          </div>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      ) : !recordedData ? (
        /* Active Recording State */
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block animate-ping absolute inset-0 opacity-75" />
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block relative shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  Listening to Voice Note...
                </span>
                <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {formatTimer(seconds)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Speak your question, instruction, or cloud task.
              </p>
            </div>
          </div>

          {/* Animated Wave Frequency Visualizer */}
          <div className="hidden sm:flex items-center gap-1 h-8 max-w-xs px-2">
            {(frequencies.length > 0 ? frequencies : [20, 45, 80, 50, 95, 30, 60, 40, 70, 85, 40, 65, 30, 50]).map(
              (val, idx) => {
                const height = Math.max(15, (val / 255) * 100);
                return (
                  <span
                    key={idx}
                    style={{ height: `${height}%` }}
                    className="w-1 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full transition-all duration-75"
                  />
                );
              }
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Cancel recording"
              aria-label="Cancel recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleStopRecording}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Done Speaking
            </button>
          </div>
        </div>
      ) : (
        /* Preview Before Sending State */
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPreview}
              className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition-all shrink-0 font-bold"
              aria-label={isPlayingPreview ? 'Pause preview' : 'Play preview'}
            >
              {isPlayingPreview ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <div>
              <div className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                <span>Voice Note Ready</span>
                <span className="font-mono text-emerald-400 text-xs">
                  ({formatTimer(recordedData.duration)})
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Ready to send to CloudConnect AI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              Re-record
            </button>

            <button
              onClick={handleSend}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              Send Voice Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
