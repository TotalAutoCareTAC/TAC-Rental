
import React, { useState, useEffect, useMemo } from 'react';
import { Tenant, PaymentRecord, TenantCalculations } from './types';
import { SummaryCards } from './components/SummaryCards';
import { PaymentModal } from './components/PaymentModal';
import { TenantModal } from './components/TenantModal';
import { calculateTenantData, formatCurrency, generateId } from './utils/calculations';

const DAYS_OF_WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Logo = () => (
  <div className="relative group cursor-pointer">
    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
    <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-500 dark:to-purple-600 rounded-2xl shadow-xl transition-all duration-300 transform group-hover:scale-110 group-active:scale-95 border border-white/10">
      <svg className="w-7 h-7 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    </div>
  </div>
);

const App: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState<TenantCalculations | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null | 'new'>(null);
  const [currentDate] = useState(new Date());
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const savedPayments = localStorage.getItem('landlord_ledger_payments');
    const savedTenants = localStorage.getItem('landlord_ledger_tenants');
    
    if (savedPayments) {
      try { setPayments(JSON.parse(savedPayments)); } catch (e) { console.error(e); }
    }
    
    if (savedTenants) {
      try { 
        const parsed = JSON.parse(savedTenants);
        if (Array.isArray(parsed)) {
          setTenants(parsed);
        }
      } catch (e) { 
        console.error("Failed to load tenants", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('landlord_ledger_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('landlord_ledger_tenants', JSON.stringify(tenants));
  }, [tenants]);

  const tenantStats = useMemo(() => {
    return tenants.map(t => calculateTenantData(t, payments, currentDate));
  }, [tenants, payments, currentDate]);

  const handleLogPayment = (amount: number, date: string) => {
    if (!selectedTenantForPayment) return;

    const newRecord: PaymentRecord = {
      id: generateId(),
      tenantId: selectedTenantForPayment.tenant.id,
      datePaid: date,
      amountPaid: Number(amount) || 0
    };

    setPayments(prev => [...prev, newRecord]);
    setSelectedTenantForPayment(null);
  };

  const handleSaveTenant = (tenantData: Omit<Tenant, 'id'> & { id?: string }) => {
    if (tenantData.id) {
      setTenants(prev => prev.map(t => t.id === tenantData.id ? { ...t, ...tenantData } as Tenant : t));
    } else {
      const newTenant: Tenant = {
        ...tenantData,
        id: generateId()
      };
      setTenants(prev => [...prev, newTenant]);
    }
    setEditingTenant(null);
  };

  const executeDeleteTenant = (id: string) => {
    setTenants(currentTenants => currentTenants.filter(t => t.id !== id));
    setPayments(currentPayments => currentPayments.filter(p => p.tenantId !== id));
    
    if (showHistoryFor === id) {
      setShowHistoryFor(null);
    }
    setConfirmDeleteId(null);
  };

  const removePayment = (paymentId: string) => {
    setPayments(prev => prev.filter(p => p.id !== paymentId));
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm inline-block";
    switch (status) {
      case 'Paid': return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800`;
      case 'Late': return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800`;
      case 'Overdue': return `${base} bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800`;
      default: return `${base} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700`;
    }
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-8 bg-slate-50 dark:bg-[#0b0f19]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
        <header className="flex items-center justify-between mb-10 pt-2">
          <div className="flex items-center gap-5 group">
            <Logo />
            <div className="flex flex-col">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 dark:from-indigo-400 dark:via-blue-300 dark:to-purple-400 hover:scale-[1.02] transition-transform cursor-default">
                TAC Rental
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <p className="text-indigo-500/80 dark:text-indigo-400/80 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]">
                  Premium Management
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-500/50 hover:text-indigo-500 dark:hover:text-indigo-400 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.929 7.929l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
            <button 
              onClick={() => setEditingTenant('new')}
              className="p-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 dark:hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all"
              aria-label="Add Tenant"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </header>

        <SummaryCards stats={tenantStats} />

        <div className="space-y-4">
          {tenantStats.length === 0 && (
            <div className="text-center py-20 px-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-800 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mb-2">Portfolio Empty</p>
              <h3 className="text-slate-900 dark:text-white text-xl font-black mb-6">Ready to scale your rental business?</h3>
              <button 
                onClick={() => setEditingTenant('new')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all uppercase text-sm tracking-widest"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                Register First Tenant
              </button>
            </div>
          )}
          {tenantStats.map((data) => (
            <div key={data.tenant.id} className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 group relative">
              <div className="p-6 flex flex-col gap-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{data.tenant.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={getStatusBadge(data.status)}>{data.status}</span>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {data.tenant.frequency === 'Monthly' 
                          ? `Due Day ${data.tenant.dueDay}` 
                          : `Due ${DAYS_OF_WEEK_LABELS[data.tenant.dueDayOfWeek ?? 0]}s`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {data.tenant.phone && (
                      <a 
                        href={`https://wa.me/${data.tenant.phone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-11 h-11 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition-all shadow-sm"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.602 6.006L0 24l6.149-1.613a11.77 11.77 0 005.9 1.569h.005c6.636 0 12.032-5.396 12.035-12.031a11.774 11.774 0 00-3.417-8.529z"/></svg>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Balance Due</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(data.balanceDue)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Days Delayed</span>
                    <span className={`text-2xl font-black tracking-tight ${data.daysLate > 0 ? 'text-rose-500 drop-shadow-sm' : 'text-slate-300 dark:text-slate-700'}`}>
                      {data.daysLate}d
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 flex justify-between items-center border border-slate-100 dark:border-slate-800/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-bold">Total Collection</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(data.totalPaid)}</span>
                    </div>
                    <button 
                        onClick={() => setShowHistoryFor(showHistoryFor === data.tenant.id ? null : data.tenant.id)}
                        className="px-4 py-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest"
                    >
                        Detailed Log
                        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showHistoryFor === data.tenant.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>

                {showHistoryFor === data.tenant.id && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                        {data.history.length === 0 ? (
                            <p className="text-center text-xs text-slate-400 italic py-3">No ledger events recorded.</p>
                        ) : (
                            data.history.map(p => (
                                <div key={p.id} className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl group/item hover:border-emerald-500/30 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-800 dark:text-slate-200">{formatCurrency(p.amountPaid)}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{new Date(p.datePaid).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <button 
                                        onClick={() => removePayment(p.id)}
                                        className="opacity-0 group-hover/item:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-3">
                   <div className="flex gap-5">
                    <button 
                      onClick={() => setEditingTenant(data.tenant)}
                      className="text-xs font-black text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]"
                    >
                      Profile
                    </button>
                    {confirmDeleteId === data.tenant.id ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => executeDeleteTenant(data.tenant.id)}
                          className="text-[10px] font-black text-white bg-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors uppercase tracking-widest animate-pulse shadow-lg shadow-rose-600/20"
                        >
                          Delete Final
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmDeleteId(data.tenant.id)}
                        className="text-xs font-black text-rose-400 hover:text-rose-600 transition-colors uppercase tracking-[0.2em]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedTenantForPayment(data)}
                    className="px-8 py-3 bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-black rounded-[1.25rem] hover:bg-indigo-700 dark:hover:bg-indigo-400 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-[0.15em]"
                  >
                    Post Payment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-16 py-10 text-center border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">
            TAC Rental &bull; {new Date().getFullYear()} &bull; Professional Ledger Systems
          </p>
        </footer>
      </div>

      {selectedTenantForPayment && (
        <PaymentModal 
          data={selectedTenantForPayment}
          onClose={() => setSelectedTenantForPayment(null)}
          onSave={handleLogPayment}
        />
      )}

      {editingTenant && (
        <TenantModal 
          tenant={editingTenant === 'new' ? null : editingTenant}
          onClose={() => setEditingTenant(null)}
          onSave={handleSaveTenant}
        />
      )}
    </div>
  );
};

export default App;
