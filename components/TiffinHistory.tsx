
import React from 'react';
import { MealLog, PaymentLog } from '../types';

interface HistoryProps {
  logs: MealLog[];
  payments: PaymentLog[];
}

const TiffinHistory: React.FC<HistoryProps> = ({ logs, payments }) => {
  const timeline = [
    ...logs.map(l => ({ ...l, entryType: 'MEAL' as const })),
    ...payments.map(p => ({ ...p, entryType: 'PAYMENT' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Activity Timeline</h2>
      
      {timeline.length === 0 ? (
        <div className="p-12 text-center text-slate-500 italic bg-slate-900 rounded-3xl border border-dashed border-slate-800">
          No activity recorded yet. Start tracking from the dashboard or calendar.
        </div>
      ) : (
        <div className="space-y-3">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  item.entryType === 'PAYMENT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {item.entryType === 'PAYMENT' ? '💰' : '🍱'}
                </div>
                <div>
                  <p className="font-bold text-slate-200">
                    {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {item.entryType === 'PAYMENT' ? `Refill: ₹${(item as PaymentLog).amount}` : (item as MealLog).type}
                  </p>
                </div>
              </div>
              
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                item.entryType === 'PAYMENT' ? 'bg-emerald-500 text-slate-950' :
                (item as MealLog).status === 'Delivered' ? 'bg-indigo-500/20 text-indigo-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {item.entryType === 'PAYMENT' ? 'Payment' : (item as MealLog).status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TiffinHistory;
