
import React, { useState, useEffect } from 'react';
import { AppTab, TiffinSubscription, MealLog, MealStatus, PaymentLog } from './types';
import TiffinDashboard from './components/TiffinDashboard';
import TiffinCalendar from './components/TiffinCalendar';
import TiffinHistory from './components/TiffinHistory';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Dashboard from './components/Dashboard';
import TextStudio from './components/TextStudio';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import LiveStudio from './components/LiveStudio';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const getInitialState = (): TiffinSubscription => ({
    id: '1',
    totalCredits: 30,
    remainingCredits: 30,
    logs: [],
    payments: [{ date: new Date().toISOString(), amount: 0, tiffins: 30 }],
    lastPaymentDate: new Date().toISOString()
  });

  const [subscription, setSubscription] = useState<TiffinSubscription>(() => {
    try {
      const saved = localStorage.getItem('tiffin_sub');
      return saved ? JSON.parse(saved) : getInitialState();
    } catch (e) {
      return getInitialState();
    }
  });

  useEffect(() => {
    localStorage.setItem('tiffin_sub', JSON.stringify(subscription));
  }, [subscription]);

  // Enhanced to allow clearing (null status means delete)
  const updateMealStatus = (date: Date, status: MealStatus | null) => {
    const dateStr = date.toDateString();
    const isSunday = date.getDay() === 0;
    const mealType = isSunday ? 'Lunch' : 'Dinner';

    setSubscription(prev => {
      const existingIdx = prev.logs.findIndex(l => new Date(l.date).toDateString() === dateStr);
      const newLogs = [...prev.logs];
      let creditAdj = 0;
      
      // Refund if the old status was 'Delivered'
      if (existingIdx >= 0) {
        const prevStatus = newLogs[existingIdx].status;
        if (prevStatus === 'Delivered') creditAdj += 1;
        
        // If the same status is selected again, we effectively "uncheck" it
        if (prevStatus === status || status === null) {
          newLogs.splice(existingIdx, 1);
          return {
            ...prev,
            logs: newLogs,
            remainingCredits: Math.max(0, prev.remainingCredits + creditAdj)
          };
        }
        newLogs.splice(existingIdx, 1);
      }

      // Add new status if not null
      if (status !== null) {
        newLogs.push({ date: date.toISOString(), status, type: mealType });
        if (status === 'Delivered') creditAdj -= 1;
      }

      const newRemaining = Math.max(0, prev.remainingCredits + creditAdj);

      if (status === 'Delivered' && newRemaining === 0) {
        setTimeout(() => {
          alert("🎉 All 30 tiffins have been delivered! Please record a new payment to continue tracking.");
        }, 300);
      }

      return {
        ...prev,
        logs: newLogs,
        remainingCredits: newRemaining
      };
    });
  };

  const addPayment = (date: Date, amount: number) => {
    const tiffins = 30;
    const newPayment: PaymentLog = {
      date: date.toISOString(),
      amount,
      tiffins
    };

    setSubscription(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment],
      totalCredits: prev.totalCredits + tiffins,
      remainingCredits: prev.remainingCredits + tiffins,
      lastPaymentDate: date.toISOString()
    }));
  };

  const resetSubscription = () => {
    const amountStr = window.prompt("Payment amount for next 30 tiffins:", "2500");
    if (amountStr !== null) {
      const amount = parseFloat(amountStr);
      if (!isNaN(amount)) addPayment(new Date(), amount);
    }
  };

  const resetCurrentMonth = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    const confirm = window.confirm(`Clear all data for ${now.toLocaleString('default', { month: 'long' })} ${year}?`);
    
    if (confirm) {
      setSubscription(prev => {
        const currentMonthLogs = prev.logs.filter(log => {
          const d = new Date(log.date);
          return d.getMonth() === month && d.getFullYear() === year;
        });
        
        // Count how many 'Delivered' were removed to refund credits
        const deliveredRefund = currentMonthLogs.filter(l => l.status === 'Delivered').length;
        
        const filteredLogs = prev.logs.filter(log => {
          const d = new Date(log.date);
          return !(d.getMonth() === month && d.getFullYear() === year);
        });
        const filteredPayments = prev.payments.filter(p => {
          const d = new Date(p.date);
          return !(d.getMonth() === month && d.getFullYear() === year);
        });
        
        return {
          ...prev,
          logs: filteredLogs,
          payments: filteredPayments,
          remainingCredits: prev.remainingCredits + deliveredRefund
        };
      });
    }
  };

  const exportToExcel = () => {
    const headers = ["Type", "Date", "Status/Amount", "Meal Type", "Tiffins Added"];
    const rows = [
      ...subscription.logs.map(l => ["Meal", new Date(l.date).toLocaleDateString(), l.status, l.type, "0"]),
      ...subscription.payments.map(p => ["Payment", new Date(p.date).toLocaleDateString(), `₹${p.amount}`, "-", p.tiffins.toString()])
    ];
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tiffin_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullReset = () => {
    if (window.confirm("Delete ALL data permanently?")) {
      localStorage.clear();
      // Hard reload to guarantee a fresh state and clear any persistent memory
      window.location.reload();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <TiffinDashboard subscription={subscription} onAction={updateMealStatus} onReset={resetSubscription} />;
      case 'calendar': 
        return (
          <TiffinCalendar 
            logs={subscription.logs} 
            payments={subscription.payments} 
            onAction={updateMealStatus} 
            onPayment={addPayment} 
            onResetMonth={resetCurrentMonth}
            onExport={exportToExcel}
          />
        );
      case 'history': 
        return <TiffinHistory logs={subscription.logs} payments={subscription.payments} />;
      case 'ai-hub':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'text':
        return <TextStudio />;
      case 'image':
        return <ImageStudio />;
      case 'video':
        return <VideoStudio />;
      case 'live':
        return <LiveStudio />;
      case 'settings':
        return (
          <div className="p-8 glass rounded-3xl space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-slate-100 tracking-tight">Data Management</h2>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-6">
                 <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">Warning</p>
                 <p className="text-sm text-amber-200/80 leading-relaxed">Resetting will permanently remove your subscription history, payments, and meal logs. This action cannot be undone.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={exportToExcel}
                  className="px-6 py-3 bg-indigo-600 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg hover:bg-indigo-500 transition-all"
                >
                  Export Data (CSV)
                </button>
                <button 
                  onClick={handleFullReset}
                  className="px-6 py-3 bg-rose-600 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg hover:bg-rose-500 transition-all"
                >
                  Full Reset
                </button>
              </div>
            </div>
          </div>
        );
      default: return <TiffinDashboard subscription={subscription} onAction={updateMealStatus} onReset={resetSubscription} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
