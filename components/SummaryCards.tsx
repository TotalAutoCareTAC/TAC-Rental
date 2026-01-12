
import React from 'react';
import { TenantCalculations } from '../types';
import { formatCurrency } from '../utils/calculations';

interface SummaryCardsProps {
  stats: TenantCalculations[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const totalCollected = stats.reduce((acc, curr) => {
    const val = Number(curr.totalPaid);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const totalOutstanding = stats.reduce((acc, curr) => {
    const val = Number(curr.balanceDue);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const overdueCount = stats.filter(s => s.status === 'Overdue').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
      <div className="group bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-50"></div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Portfolio Collected</p>
        <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
          {formatCurrency(totalCollected)}
        </h3>
      </div>
      
      <div className="group bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 opacity-50"></div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Portfolio Outstanding</p>
        <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
          {formatCurrency(totalOutstanding)}
        </h3>
      </div>

      <div className="group bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 opacity-50"></div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Overdue Alerts</p>
        <h3 className="text-3xl font-black text-amber-600 dark:text-amber-500 tracking-tight">{overdueCount}</h3>
      </div>
    </div>
  );
};
