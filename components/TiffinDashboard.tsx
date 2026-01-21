
import React from 'react';
import { TiffinSubscription, MealStatus } from '../types';

interface DashboardProps {
  subscription: TiffinSubscription;
  onAction: (date: Date, status: MealStatus | null) => void;
  onReset: () => void;
}

const TiffinDashboard: React.FC<DashboardProps> = ({ subscription, onAction, onReset }) => {
  const today = new Date();
  const isSunday = today.getDay() === 0;
  const currentMealType = isSunday ? 'Lunch' : 'Dinner';
  
  const todayLog = subscription.logs.find(l => new Date(l.date).toDateString() === today.toDateString());

  const percentage = Math.min(100, (subscription.remainingCredits / 30) * 100);
  const isLow = subscription.remainingCredits <= 3;

  const handleAction = (status: MealStatus) => {
    // If clicking an already active status, clear it (uncheck)
    if (todayLog?.status === status) {
      onAction(today, null);
    } else {
      onAction(today, status);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Progress Section */}
      <div className="relative p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black mb-2 tracking-tight">
              {subscription.remainingCredits} <span className="text-slate-500 text-xl font-medium">Credits</span>
            </h1>
            <p className="text-slate-400">Total Credits Tracked: {subscription.totalCredits}</p>
            {isLow && (
              <div className="mt-4 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-bold animate-pulse inline-block">
                Refill Required Soon!
              </div>
            )}
          </div>

          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-slate-800 fill-none" strokeWidth="12" />
              <circle 
                cx="80" cy="80" r="70" 
                className={`fill-none transition-all duration-1000 ${isLow ? 'stroke-rose-500' : 'stroke-indigo-500'}`} 
                strokeWidth="12" 
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * percentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-bold">
              <span className="text-2xl">{subscription.remainingCredits}</span>
              <span className="text-[10px] uppercase text-slate-500 tracking-widest">Left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Action Card */}
      <div className="p-8 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/20 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Log Today</h2>
            <p className="text-slate-500 text-sm">{today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} • <span className="text-indigo-400 font-semibold">{currentMealType}</span></p>
          </div>
          {todayLog && (
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border ${
                todayLog.status === 'Delivered' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {todayLog.status}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => handleAction('Delivered')}
            className={`flex flex-col items-center justify-center p-8 rounded-2xl transition-all group active:scale-95 shadow-lg border-2 ${todayLog?.status === 'Delivered' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'}`}
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🍱</span>
            <span className="font-bold">{todayLog?.status === 'Delivered' ? 'Uncheck Delivered' : 'Mark Delivered'}</span>
          </button>

          <button 
            onClick={() => handleAction('Skipped')}
            className={`flex flex-col items-center justify-center p-8 rounded-2xl transition-all group active:scale-95 border-2 ${todayLog?.status === 'Skipped' ? 'bg-rose-600 border-rose-500' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'}`}
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🚫</span>
            <span className="font-bold">{todayLog?.status === 'Skipped' ? 'Uncheck Skipped' : 'Skip Today'}</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center pt-4">
        <button 
          onClick={onReset}
          className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500 transition-all text-sm font-bold flex items-center gap-3 shadow-lg"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">₹</div>
          Record New 30 Tiffin Payment
        </button>
      </div>
    </div>
  );
};

export default TiffinDashboard;
