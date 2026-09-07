import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Film, 
  Sparkles, 
  Download, 
  Send, 
  Play, 
  Pause, 
  RotateCcw, 
  Upload, 
  Wand2, 
  Loader2, 
  CheckCircle2,
  Video
} from 'lucide-react';
import { GeneratedVideoData } from '../types';

interface VideoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat: (videoData: GeneratedVideoData) => void;
  initialPrompt?: string;
  initialStartingImage?: string;
}

const VIDEO_PROMPT_SUGGESTIONS = [
  'A cinematic drone flight over a futuristic glowing neon metropolis in the rain at twilight',
  'A golden eagle soaring gracefully above snow-capped mountain peaks at golden hour sunrise',
  'Macro shot of colorful ink blooming and swirling hypnotically in crystal clear water',
  'An ancient steam locomotive traveling across a dramatic arched viaduct in autumn mountains',
  'Hypnotic bioluminescent jellyfish pulsating with rainbow light through the deep ocean abyss',
];

export const VideoStudioModal: React.FC<VideoStudioModalProps> = ({
  isOpen,
  onClose,
  onInsertToChat,
  initialPrompt = '',
  initialStartingImage,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [startingImage, setStartingImage] = useState<string | null>(initialStartingImage || null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialStartingImage) setStartingImage(initialStartingImage);
  }, [initialPrompt, initialStartingImage]);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setProgressPercent(10);
    setProgressStage('Initializing Veo 3.1 Video Engine...');

    try {
      // Step 1: Request video generation
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageBase64: startingImage || undefined,
          aspectRatio,
          resolution,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start video generation');
      }

      const operationName = data.operationName;

      // Step 2: Poll operation status
      let done = false;
      let attempts = 0;
      const maxAttempts = 40;

      while (!done && attempts < maxAttempts) {
        attempts++;
        // Update simulated/actual progress stages
        if (attempts === 1) {
          setProgressPercent(25);
          setProgressStage('Calculating spatio-temporal motion vectors...');
        } else if (attempts === 3) {
          setProgressPercent(45);
          setProgressStage('Synthesizing high-frame-rate latent sequences...');
        } else if (attempts === 5) {
          setProgressPercent(75);
          setProgressStage('Rendering lighting reflections and optical flow...');
        } else if (attempts >= 7) {
          setProgressPercent(90);
          setProgressStage('Encoding final MP4 video stream...');
        }

        await new Promise((r) => setTimeout(r, 2000));

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        const statusData = await statusRes.json();
        if (statusData.done) {
          done = true;
          setProgressPercent(100);
          setProgressStage('Video rendering complete!');

          setGeneratedVideo({
            url: statusData.videoUrl,
            prompt: prompt.trim(),
            aspectRatio,
            resolution,
            status: 'ready',
            progress: 100,
            operationName,
          });
          break;
        }
      }

      if (!done) {
        throw new Error('Video generation timed out. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Video generation encountered an error.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setStartingImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleInsert = () => {
    if (generatedVideo) {
      onInsertToChat(generatedVideo);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-emerald-400 text-zinc-950 flex items-center justify-center font-bold shadow-md">
              <Film className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Veo AI Video Generator
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300">
                  veo-3.1-lite
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Generate cinematic motion videos from text descriptions or animate uploaded images
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Video Scene Prompt
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const random = VIDEO_PROMPT_SUGGESTIONS[Math.floor(Math.random() * VIDEO_PROMPT_SUGGESTIONS.length)];
                    setPrompt(random);
                  }}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" />
                  Inspire Me
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe camera motion, subjects, lighting, environment, and temporal action..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/60 leading-relaxed resize-none"
              />
            </div>

            {/* Starting Image (Image-to-Video) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  Starting Frame / Initial Photo (Optional)
                </label>
                {startingImage && (
                  <button
                    type="button"
                    onClick={() => setStartingImage(null)}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {startingImage ? (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                  <img
                    src={startingImage}
                    alt="Starting frame"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-cover rounded-lg border border-zinc-700"
                  />
                  <div className="text-xs text-zinc-300 flex-1">
                    <span className="font-semibold text-purple-300">Image-to-Video mode:</span> Veo will animate this image into motion
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-zinc-800 hover:border-purple-500/40 bg-zinc-950/40 hover:bg-zinc-950 text-zinc-400 text-xs cursor-pointer transition-colors">
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>Upload a photo to animate into a video</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Video Aspect Ratio & Resolution */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-200 block mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-3 py-2 rounded-xl text-center text-xs font-mono transition-all border ${
                      aspectRatio === '16:9'
                        ? 'bg-purple-600 text-white font-bold border-purple-400 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    16:9 Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`px-3 py-2 rounded-xl text-center text-xs font-mono transition-all border ${
                      aspectRatio === '9:16'
                        ? 'bg-purple-600 text-white font-bold border-purple-400 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    9:16 Portrait
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-200 block mb-1.5">
                  Resolution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolution('720p')}
                    className={`px-3 py-2 rounded-xl text-center text-xs font-mono transition-all border ${
                      resolution === '720p'
                        ? 'bg-purple-600 text-white font-bold border-purple-400 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    720p HD
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution('1080p')}
                    className={`px-3 py-2 rounded-xl text-center text-xs font-mono transition-all border ${
                      resolution === '1080p'
                        ? 'bg-purple-600 text-white font-bold border-purple-400 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    1080p Full HD
                  </button>
                </div>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Generate Action Button */}
            <button
              onClick={handleStartGeneration}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md ${
                prompt.trim() && !isGenerating
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-[0.99]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Video...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>Generate Veo Video</span>
                </>
              )}
            </button>
          </div>

          {/* Player / Preview Column (Right) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[340px] rounded-2xl bg-zinc-950 border border-zinc-800/80 p-4 relative overflow-hidden">
            {isGenerating ? (
              <div className="w-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="relative w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Film className="w-8 h-8 animate-pulse" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-purple-500/30 animate-ping"></div>
                </div>

                <div>
                  <div className="text-sm font-bold text-zinc-100">Generating AI Video</div>
                  <div className="text-xs text-purple-400 font-mono mt-1">{progressStage}</div>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                  Video generation utilizes diffusion temporal decoders. High-availability rendering is active.
                </div>
              </div>
            ) : generatedVideo ? (
              <div className="w-full flex flex-col items-center gap-3">
                {/* Video Player */}
                <div className="relative group w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={generatedVideo.url}
                    controls
                    loop
                    playsInline
                    className="w-full max-h-[360px] rounded-xl object-contain bg-black"
                  />
                </div>

                <div className="w-full flex items-center justify-between text-[11px] text-zinc-400 font-mono px-1">
                  <span>Veo 3.1 • {generatedVideo.resolution}</span>
                  <span className="text-purple-400">Ready</span>
                </div>

                {/* Action Buttons */}
                <div className="w-full grid grid-cols-2 gap-2">
                  <a
                    href={generatedVideo.url}
                    download={`veo-video-${Date.now()}.mp4`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Download MP4</span>
                  </a>

                  <button
                    onClick={handleInsert}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Add to Chat</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-zinc-500">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-600">
                  <Video className="w-7 h-7" />
                </div>
                <div className="text-xs font-semibold text-zinc-400">Veo Video Viewport</div>
                <div className="text-[11px] text-zinc-600 mt-1 max-w-xs">
                  Your generated video will render here with full playback controls and direct MP4 export.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
