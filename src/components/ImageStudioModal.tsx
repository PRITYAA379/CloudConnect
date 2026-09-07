import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Send, 
  Film, 
  Sliders, 
  RefreshCw, 
  Upload, 
  Check, 
  ZoomIn,
  Wand2
} from 'lucide-react';
import { GeneratedImageData } from '../types';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat: (imageData: GeneratedImageData) => void;
  onOpenVideoWithImage?: (imageUrl: string, prompt: string) => void;
  initialPrompt?: string;
  initialImage?: string;
}

const STYLE_PRESETS = [
  { id: 'photorealistic', name: 'Photorealistic', desc: '8K studio photography, Hasselblad' },
  { id: 'cinematic', name: 'Cinematic', desc: '35mm anamorphic film, dramatic lighting' },
  { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon lights, futuristic tech, twilight' },
  { id: 'anime', name: 'Anime / Manga', desc: 'Vibrant Makoto Shinkai anime aesthetic' },
  { id: '3d-render', name: '3D Digital Art', desc: 'Unreal Engine 5, Octane render' },
  { id: 'watercolor', name: 'Watercolor', desc: 'Soft pigment wash on textured paper' },
  { id: 'vintage-book', name: 'Book Illustration', desc: 'Antique copperplate engraving & ink' },
  { id: 'minimalist', name: 'Minimalist Vector', desc: 'Clean vector graphic, flat colors' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', iconRatio: 'aspect-square' },
  { id: '16:9', label: '16:9 Landscape', iconRatio: 'aspect-video' },
  { id: '9:16', label: '9:16 Portrait', iconRatio: 'aspect-[9/16]' },
  { id: '4:3', label: '4:3 Standard', iconRatio: 'aspect-[4/3]' },
  { id: '3:4', label: '3:4 Vertical', iconRatio: 'aspect-[3/4]' },
];

const PROMPT_SUGGESTIONS = [
  'A mystical ancient library with floating glowing leather-bound books and starry celestial skylight',
  'A neon-drenched cyberpunk samurai standing on a skyscraper ledge in rain, reflection, 8k',
  'A cozy botanical glass greenhouse cafe with sunlight streaming through hanging ferns',
  'A hyper-detailed mechanical hummingbird made of gold filigree and glowing amethyst crystals',
  'An ethereal astronaut exploring an alien crystal forest with biomorphic bioluminescent flora',
];

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  onInsertToChat,
  onOpenVideoWithImage,
  initialPrompt = '',
  initialImage,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '512px'>('1K');
  const [referenceImage, setReferenceImage] = useState<string | null>(initialImage || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedImageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle,
          aspectRatio,
          imageSize,
          referenceImageBase64: referenceImage || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedResult({
        url: data.imageUrl,
        prompt: prompt.trim(),
        style: selectedStyle,
        aspectRatio,
        modelUsed: data.modelUsed || 'gemini-3.1-flash-image',
      });
    } catch (err: any) {
      setError(err?.message || 'Error generating image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInsert = () => {
    if (generatedResult) {
      onInsertToChat(generatedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                AI Image Studio
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                  gemini-3.1-flash-image
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Generate high-resolution images, illustrations, and artwork from text or photos
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
          <div className="lg:col-span-7 space-y-4">
            {/* Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-200">
                  Prompt Description
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const random = PROMPT_SUGGESTIONS[Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)];
                    setPrompt(random);
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" />
                  Surprise Prompt
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe what you want to create in vivid detail (subject, atmosphere, lighting, style)..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 leading-relaxed resize-none"
              />
            </div>

            {/* Style Presets Grid */}
            <div>
              <label className="text-xs font-semibold text-zinc-200 block mb-1.5">
                Artistic Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      selectedStyle === style.id
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate">{style.name}</div>
                    <div className="text-[9px] text-zinc-500 truncate mt-0.5">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio and Resolution */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-200 block mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ASPECT_RATIOS.slice(0, 3).map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`px-2 py-1.5 rounded-lg text-center text-xs font-mono transition-all border ${
                        aspectRatio === ratio.id
                          ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {ratio.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-200 block mb-1.5">
                  Resolution
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['512px', '1K', '2K'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setImageSize(size)}
                      className={`px-2 py-1.5 rounded-lg text-center text-xs font-mono transition-all border ${
                        imageSize === size
                          ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Reference Image (Edit Image / Photo Transform) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  Starting Reference Photo (Optional)
                </label>
                {referenceImage && (
                  <button
                    type="button"
                    onClick={() => setReferenceImage(null)}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {referenceImage ? (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                  <img
                    src={referenceImage}
                    alt="Reference"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover rounded-lg border border-zinc-700"
                  />
                  <div className="text-xs text-zinc-300 flex-1">
                    Reference photo loaded for image-to-image editing
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-zinc-800 hover:border-emerald-500/40 bg-zinc-950/40 hover:bg-zinc-950 text-zinc-400 text-xs cursor-pointer transition-colors">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Upload a photo to transform or edit</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md ${
                prompt.trim() && !isGenerating
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.99]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing High-Resolution Image...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Image</span>
                </>
              )}
            </button>
          </div>

          {/* Preview Column (Right) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center min-h-[320px] rounded-2xl bg-zinc-950 border border-zinc-800/80 p-4 relative overflow-hidden">
            {generatedResult ? (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="relative group w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                  <img
                    src={generatedResult.url}
                    alt={generatedResult.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[380px] object-contain rounded-xl"
                  />
                </div>

                <div className="w-full flex items-center justify-between text-[11px] text-zinc-400 font-mono px-1">
                  <span>Ratio: {generatedResult.aspectRatio}</span>
                  <span className="text-emerald-400">Generated</span>
                </div>

                {/* Actions Toolbar */}
                <div className="w-full grid grid-cols-3 gap-2">
                  <a
                    href={generatedResult.url}
                    download={`ai-image-${Date.now()}.png`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download</span>
                  </a>

                  {onOpenVideoWithImage && (
                    <button
                      onClick={() => {
                        onOpenVideoWithImage(generatedResult.url, generatedResult.prompt);
                        onClose();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-colors"
                      title="Create a Veo video animated from this image"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Animate</span>
                    </button>
                  )}

                  <button
                    onClick={handleInsert}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Add to Chat</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-zinc-500">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-600">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div className="text-xs font-semibold text-zinc-400">Image Canvas Preview</div>
                <div className="text-[11px] text-zinc-600 mt-1 max-w-xs">
                  Your generated artwork will appear here in high-resolution with download and video animation controls.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
