
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  
  const gemini = new GeminiService();

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setVideoUrl(null);
    try {
      const url = await gemini.generateVideo(prompt);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate video: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-slate-900/50 rounded-3xl border border-slate-800">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
           <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Paid API Key Required</h2>
        <p className="text-slate-400 max-w-md mb-8">
          To use Veo 3.1 video generation, you must provide a billing-enabled API key. Your data remains secure and is only used for your requests.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={handleOpenKey}
            className="px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            Select API Key
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            className="text-sm text-indigo-400 hover:underline"
          >
            Learn about billing
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-2">Director's Script</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Describe a scene, motion, and style. Veo 3.1 Fast excels at consistent motion and cinematic quality.
            </p>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-pink-500 outline-none transition-all mb-6"
              placeholder="A high-speed neon motorcycle chase through a rainy metropolis, tracking shot from behind..."
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 disabled:opacity-50"
            >
              {loading ? "Generating Cinema (takes ~1-2 mins)..." : "Generate Cinematic Clip"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Resolution</span>
                <span className="font-semibold text-sm">720p HD</span>
             </div>
             <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Ratio</span>
                <span className="font-semibold text-sm">16:9 Landscape</span>
             </div>
          </div>
        </div>

        <div className="w-full md:w-[450px]">
           <div className="aspect-[16/9] w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl">
              {videoUrl ? (
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                   {loading ? (
                     <div className="flex flex-col items-center gap-4 px-8 text-center">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-75"></div>
                          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                        <p className="text-sm animate-pulse">Veo is dreaming up your video...</p>
                        <p className="text-[10px] opacity-60">This can take up to 2 minutes. Please don't leave this page.</p>
                     </div>
                   ) : (
                     <>
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                           <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </div>
                        <p className="font-medium text-slate-500">Video Canvas</p>
                     </>
                   )}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
