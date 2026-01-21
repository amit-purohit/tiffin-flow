
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';

export default function ImageStudio() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  
  // Use a stable reference for service
  const gemini = new GeminiService();

  // Check whether a paid API key has been selected before allowing high-quality generation
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for environments where the check isn't available
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
    }
    // Assume selection success as per guidelines to mitigate race conditions
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setImageUrl(null);
    try {
      const result = await gemini.generateImage(prompt);
      setImageUrl(result);
    } catch (err: any) {
      console.error(err);
      // Reset key selection if a billing/project error is detected
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
      }
      alert("Failed to generate image: " + err.message);
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
          To use Gemini 3 Pro high-quality image generation, you must select a billing-enabled API key.
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
            rel="noopener noreferrer"
            className="text-sm text-indigo-400 hover:underline"
          >
            Learn about billing
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-4">Prompt Design</h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Describe your vision in detail. Specify style, lighting, composition, and subject for the best results.
          </p>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none transition-all mb-6"
            placeholder="e.g. A futuristic cyberpunk city floating in the clouds, neon reflections, 8k, cinematic lighting..."
          />

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Baking Image...
              </span>
            ) : "Forge Image"}
          </button>
        </div>

        <div className="glass rounded-3xl p-6">
           <h4 className="text-sm font-semibold text-slate-300 mb-3">Model Details</h4>
           <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Model</span>
                <span className="text-indigo-400">Gemini 3 Pro Image</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Resolution</span>
                <span className="text-indigo-400">1024 x 1024 (1K)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Format</span>
                <span className="text-indigo-400">PNG</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex items-start justify-center">
        <div className="w-full aspect-square bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative group">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                 <a 
                   href={imageUrl} 
                   download="lumina-gen.png" 
                   className="p-3 bg-white text-slate-950 rounded-full hover:scale-110 transition-transform"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 </a>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-8 text-center">
              {loading ? (
                <div className="w-24 h-24 relative">
                   <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-4 bg-slate-800 rounded-full flex items-center justify-center text-2xl">⚡</div>
                </div>
              ) : (
                <>
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-lg font-medium">Your creation will appear here</p>
                  <p className="text-sm max-w-xs mt-2">Enter a prompt and click generate to visualize your imagination</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
