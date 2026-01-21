
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';

const TextStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [useThinking, setUseThinking] = useState(true);
  const [useSearch, setUseSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  
  const gemini = new GeminiService();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);
    try {
      if (useSearch) {
        const result = await gemini.searchGrounding(prompt);
        setResponse(result);
      } else {
        const text = await gemini.generateText(prompt, useThinking);
        setResponse({ text, sources: [] });
      }
    } catch (err: any) {
      console.error(err);
      setResponse({ text: "Error: " + err.message, sources: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 md:p-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Input Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="What would you like to explore or create?"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={useThinking} 
                  onChange={(e) => setUseThinking(e.target.checked)} 
                  disabled={useSearch}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Thinking Mode</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={useSearch} 
                  onChange={(e) => setUseSearch(e.target.checked)} 
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Search Grounding</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : (
                <>
                  Generate
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {response && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-slate-200 leading-relaxed text-lg">
              {response.text}
            </div>
          </div>

          {response.sources && response.sources.length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Grounded Sources
              </h4>
              <div className="flex flex-wrap gap-2">
                {response.sources.map((source: any, idx: number) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-indigo-400 transition-colors flex items-center gap-2"
                  >
                    {source.title || source.uri}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextStudio;
