import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { VoiceNoteData } from '../types';

interface VoiceMessageBubbleProps {
  voiceNote: VoiceNoteData;
}

export const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({ voiceNote }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) {
      const src = voiceNote.audioBlobUrl || voiceNote.audioBase64;
      if (!src) return;
      const audio = new Audio(src);
      audio.ontimeupdate = () => {
        setCurrentTime(Math.floor(audio.currentTime));
      };
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      audioRef.current = audio;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio play error:', err);
      });
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Generate 20 static wave bar heights for visualization
  const waveBars = [35, 60, 45, 80, 65, 90, 50, 75, 40, 85, 70, 95, 55, 65, 40, 80, 60, 45, 70, 30];

  const totalDuration = voiceNote.durationSeconds || 12;
  const progressRatio = totalDuration > 0 ? currentTime / totalDuration : 0;

  return (
    <div className="flex flex-col gap-2 max-w-md w-full">
      {/* Audio Capsule Player */}
      <div className="flex items-center gap-3.5 bg-gradient-to-r from-emerald-950/80 via-zinc-900/90 to-zinc-900 border border-emerald-500/30 p-3.5 rounded-2xl shadow-lg backdrop-blur-md">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
          title={isPlaying ? 'Pause voice note' : 'Play voice note'}
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <Mic className="w-3.5 h-3.5" />
              Voice Note
            </span>
            <span className="text-zinc-400 font-mono">
              {formatSeconds(currentTime)} / {formatSeconds(totalDuration)}
            </span>
          </div>

          {/* Waveform Bar Track */}
          <div className="flex items-center gap-1 h-6 w-full cursor-pointer py-1">
            {waveBars.map((h, i) => {
              const barRatio = i / waveBars.length;
              const isPassed = barRatio <= progressRatio;
              return (
                <span
                  key={i}
                  style={{ height: `${Math.max(20, h)}%` }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPassed
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                      : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="shrink-0 text-emerald-400/80">
          <Volume2 className="w-4 h-4" />
        </div>
      </div>

      {/* Recognized Transcription Box */}
      {voiceNote.transcription && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300">
          <div className="flex items-center justify-between font-medium text-zinc-400 mb-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Transcribed Voice
            </span>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="hover:text-zinc-200 transition-colors p-0.5"
            >
              {showTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
          {showTranscript && (
            <p className="italic text-zinc-200 leading-relaxed pl-1 border-l-2 border-emerald-500/40">
              "{voiceNote.transcription}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};
