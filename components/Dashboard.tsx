
import React from 'react';
import { AppTab } from '../types';

interface DashboardProps {
  onNavigate: (tab: AppTab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const features = [
    {
      id: 'text',
      title: 'Text & Logic',
      description: 'Advanced reasoning, summarization, and creative writing powered by Gemini 3 Pro with Thinking capability.',
      icon: '✨',
      color: 'indigo'
    },
    {
      id: 'image',
      title: 'Visual Arts',
      description: 'Generate stunning 1K/2K/4K imagery from natural language prompts using cutting-edge diffusion models.',
      icon: '🎨',
      color: 'purple'
    },
    {
      id: 'video',
      title: 'Video Creation',
      description: 'Transform ideas into high-definition cinematic experiences with Veo 3.1 video generation.',
      icon: '🎬',
      color: 'pink'
    },
    {
      id: 'live',
      title: 'Real-time Interaction',
      description: 'Voice-to-voice conversation with near-zero latency for truly human-like digital experiences.',
      icon: '🎙️',
      color: 'emerald'
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          The Future of Creative AI
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Welcome to Lumina Studio. A unified interface for interacting with Google's most powerful generative models. Select a studio below to begin your journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onNavigate(feature.id as AppTab)}
            className="group relative flex flex-col items-start p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all duration-300 text-left"
          >
            <div className={`text-3xl mb-4 p-3 rounded-xl bg-${feature.color}-500/10 group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">{feature.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {feature.description}
            </p>
            <div className="mt-auto flex items-center gap-2 text-indigo-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Launch Studio 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </div>
          </button>
        ))}
      </div>

      <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">Deep Knowledge Integration</h2>
            <p className="text-slate-400 mb-6 max-w-lg">
              Every interaction in Lumina is grounded in real-world facts. Our studio uses Google Search grounding to ensure accuracy and freshness for every query.
            </p>
            <button 
              onClick={() => onNavigate('text')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors shadow-lg shadow-indigo-600/20"
            >
              Try Search-Grounded Chat
            </button>
          </div>
          <div className="w-full md:w-1/3 aspect-video rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
             <span className="text-slate-500 italic">Advanced Analytics Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
