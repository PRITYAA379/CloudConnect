export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioBase64: string | null;
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private timerInterval: any = null;
  private onDataCallback?: (freqs: number[]) => void;
  private onTimeUpdate?: (seconds: number) => void;
  private onTranscriptionCallback?: (text: string) => void;
  private secondsRecorded = 0;
  private speechRecognition: any = null;
  private liveTranscription: string = '';

  async start(
    onTimeUpdate?: (seconds: number) => void,
    onDataCallback?: (freqs: number[]) => void,
    onTranscriptionCallback?: (text: string) => void
  ): Promise<boolean> {
    try {
      this.onTimeUpdate = onTimeUpdate;
      this.onDataCallback = onDataCallback;
      this.onTranscriptionCallback = onTranscriptionCallback;
      this.secondsRecorded = 0;
      this.audioChunks = [];
      this.liveTranscription = '';

      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Setup audio analyzer for wave visualization
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.audioStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.startVisualizerLoop();
      }

      // Initialize Browser Live Speech Recognition (Web Speech API)
      try {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript + ' ';
            }
            this.liveTranscription = fullText.trim();
            this.onTranscriptionCallback?.(this.liveTranscription);
          };
          rec.onerror = () => {};
          rec.start();
          this.speechRecognition = rec;
        }
      } catch (_) {
        // Fallback gracefully if speech recognition not supported
      }

      // Choose supported mimeType
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // browser default
        }
      }

      this.mediaRecorder = new MediaRecorder(this.audioStream, mimeType ? { mimeType } : undefined);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(200);

      this.timerInterval = setInterval(() => {
        this.secondsRecorded += 1;
        this.onTimeUpdate?.(this.secondsRecorded);
      }, 1000);

      return true;
    } catch (err) {
      console.error('Failed to start voice recorder:', err);
      return false;
    }
  }

  private startVisualizerLoop() {
    const update = () => {
      if (this.analyser && this.dataArray && this.mediaRecorder?.state === 'recording') {
        this.analyser.getByteFrequencyData(this.dataArray);
        const freqs = Array.from(this.dataArray).slice(0, 24);
        this.onDataCallback?.(freqs);
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }

  stop(): Promise<{ blob: Blob; url: string; base64: string; duration: number; transcription?: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder not active'));
      }

      clearInterval(this.timerInterval);

      if (this.speechRecognition) {
        try {
          this.speechRecognition.stop();
        } catch (_) {}
      }

      this.mediaRecorder.onstop = async () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const base64 = await this.blobToBase64(blob);

        const capturedTranscript = this.liveTranscription ? this.liveTranscription.trim() : undefined;

        // Cleanup stream tracks
        this.cleanup();

        resolve({
          blob,
          url,
          base64,
          duration: this.secondsRecorded,
          transcription: capturedTranscript,
        });
      };

      this.mediaRecorder.stop();
    });
  }

  cancel() {
    clearInterval(this.timerInterval);
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch (_) {}
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private cleanup() {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

/**
 * Play synthesized speech audio or fallback to Web Speech API
 */
export async function speakText(
  text: string,
  audioBase64?: string,
  onEnd?: () => void
): Promise<() => void> {
  // If base64 audio provided from server
  if (audioBase64) {
    try {
      let src = audioBase64;
      if (!src.startsWith('data:')) {
        // Raw PCM / WAV audio
        src = `data:audio/wav;base64,${audioBase64}`;
      }
      const audio = new Audio(src);
      audio.onended = () => onEnd?.();
      audio.onerror = () => {
        // Fallback to speech synthesis
        fallbackSpeechSynthesis(text, onEnd);
      };
      await audio.play();
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    } catch {
      return fallbackSpeechSynthesis(text, onEnd);
    }
  }

  return fallbackSpeechSynthesis(text, onEnd);
}

function fallbackSpeechSynthesis(text: string, onEnd?: () => void): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return () => {};
  }

  window.speechSynthesis.cancel();
  const cleanText = text.replace(/[#*`_\[\]]/g, '').slice(0, 500);
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.lang.startsWith('en')) && !v.name.includes('Bad')
  );
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}
