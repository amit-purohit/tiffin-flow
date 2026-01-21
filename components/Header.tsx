
import React from 'react';
import { AppTab } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  activeTab: AppTab;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, activeTab }) => {
  // Added titles for all potential AppTab values
  const titles: Record<AppTab, string> = {
    dashboard: 'Daily Overview',
    calendar: 'Meal Calendar',
    history: 'Activity Log',
    settings: 'App Settings',
    'ai-hub': 'Lumina AI Hub',
    text: 'Text Studio',
    image: 'Image Studio',
    video: 'Video Studio',
    live: 'Live Studio'
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <h2 className="text-lg font-bold tracking-tight text-slate-200">{titles[activeTab]}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
           <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
           Live Tracker
        </div>
      </div>
    </header>
  );
};

export default Header;
