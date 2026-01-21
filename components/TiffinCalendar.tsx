
import React, { useState } from 'react';
import { MealLog, MealStatus, PaymentLog } from '../types';

interface CalendarProps {
  logs: MealLog[];
  payments: PaymentLog[];
  onAction: (date: Date, status: MealStatus | null) => void;
  onPayment: (date: Date, amount: number) => void;
  onResetMonth: () => void;
  onExport: () => void;
}

const TiffinCalendar: React.FC<CalendarProps> = ({ logs, payments, onAction, onPayment, onResetMonth, onExport }) => {
  const [selectedDay, setSelectedDay] = useState<{ day: number; date: Date } | null>(null);
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('2500');

  const getDaysInMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getStatusColor = (status?: MealStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-indigo-600 border-indigo-500 shadow-indigo-500/20';
      case 'Skipped': return 'bg-rose-600 border-rose-500 shadow-rose-500/20';
      default: return 'bg-slate-900 border-slate-800 hover:bg-slate-800';
    }
  };

  const handleDayAction = (status: MealStatus | null) => {
    if (selectedDay) {
      onAction(selectedDay.date, status);
      setSelectedDay(null);
    }
  };

  const handlePaymentSubmit = () => {
    const amount = parseFloat(paymentAmount);
    if (!isNaN(amount) && selectedDay) {
      onPayment(selectedDay.date, amount);
      setShowPaymentInput(false);
      setSelectedDay(null);
    }
  };

  return (
    <div className="relative space-y-6">
      <div className="flex flex-wrap gap-3 justify-end px-2">
         <button 
           onClick={onExport}
           className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 hover:border-indigo-500 transition-all flex items-center gap-2"
         >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
           Export Report
         </button>
         <button 
           onClick={onResetMonth}
           className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-400 hover:border-rose-500 transition-all"
         >
           Reset Month
         </button>
      </div>

      <div className="glass rounded-[2.5rem] p-4 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 px-2 relative z-10">
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            {new Date().toLocaleString('default', { month: 'long' })} {year}
          </h2>
          <div className="text-[10px] uppercase font-black text-indigo-400 tracking-widest bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20">
            Monthly Log
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1.5 md:gap-3 relative z-10">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-500 mb-2 tracking-tighter">{d}</div>
          ))}
          
          {blanks.map(i => <div key={`b-${i}`} />)}
          
          {days.map(d => {
            const date = new Date(year, month, d);
            const dateStr = date.toDateString();
            const log = logs.find(l => new Date(l.date).toDateString() === dateStr);
            const payment = payments.find(p => new Date(p.date).toDateString() === dateStr);
            const isSunday = date.getDay() === 0;
            const isToday = dateStr === new Date().toDateString();

            return (
              <button
                key={d}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedDay({ day: d, date });
                }}
                className={`
                  aspect-square rounded-2xl border flex flex-col items-center justify-center relative transition-all active:scale-95
                  ${getStatusColor(log?.status)}
                  ${isToday ? 'ring-2 ring-indigo-400 ring-offset-4 ring-offset-slate-950 border-transparent z-10' : ''}
                `}
              >
                <span className={`text-xs md:text-base font-black ${log ? 'text-white' : 'text-slate-400'}`}>{d}</span>
                
                <div className="absolute bottom-1 md:bottom-2 flex gap-1 pointer-events-none">
                  {isSunday && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-sm"></div>}
                  {payment && (
                    <div className="bg-emerald-400 text-slate-950 rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[8px] md:text-[10px] font-black shadow-lg">
                      ₹
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-950/50 rounded-3xl border border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-indigo-600 rounded-lg"></div> 
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivered</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-rose-600 rounded-lg"></div> 
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skipped</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-emerald-400 text-slate-950 flex items-center justify-center rounded-full text-[10px] font-black">₹</div> 
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</span>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {selectedDay && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setSelectedDay(null);
            setShowPaymentInput(false);
          }}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-xl font-black">
                {selectedDay.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'long' })}
              </h3>
              <button 
                onClick={() => setSelectedDay(null)}
                className="text-slate-500 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-slate-500 text-sm mb-6">What happened on this day?</p>

            {showPaymentInput ? (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Payment Amount (₹)</label>
                  <input 
                    type="number" 
                    value={paymentAmount} 
                    onChange={e => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowPaymentInput(false)} className="flex-1 py-3 rounded-xl bg-slate-800 font-bold hover:bg-slate-700">Cancel</button>
                  <button onClick={handlePaymentSubmit} className="flex-1 py-3 rounded-xl bg-emerald-600 font-bold hover:bg-emerald-500">Save Payment</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDayAction('Delivered'); }} 
                  className="w-full flex items-center gap-4 p-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all text-left group shadow-lg"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">🍱</span>
                  <div className="flex flex-col">
                    <span className="font-black text-white">Mark Delivered</span>
                    <span className="text-[10px] uppercase tracking-wider text-indigo-200">Deducts 1 Credit</span>
                  </div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDayAction('Skipped'); }} 
                  className="w-full flex items-center gap-4 p-5 rounded-2xl bg-rose-600 hover:bg-rose-500 transition-all text-left group shadow-lg"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">🚫</span>
                  <div className="flex flex-col">
                    <span className="font-black text-white">Skip Meal</span>
                    <span className="text-[10px] uppercase tracking-wider text-rose-200">No Credits Used</span>
                  </div>
                </button>
                
                {/* Clear/Uncheck Option */}
                {logs.some(l => new Date(l.date).toDateString() === selectedDay.date.toDateString()) && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDayAction(null); }} 
                    className="w-full flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-left group"
                  >
                    <span className="text-xl">🔄</span>
                    <span className="font-bold text-sm">Clear / Uncheck Status</span>
                  </button>
                )}

                <button 
                  onClick={(e) => { e.stopPropagation(); setShowPaymentInput(true); }} 
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all text-left group mt-2"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">💰</span>
                  <span className="font-bold text-slate-300">Record Payment</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TiffinCalendar;
