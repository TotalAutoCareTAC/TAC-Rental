
import React from 'react';
import { TenantCalculations } from '../types';
import { formatCurrency } from '../utils/calculations';

interface FinancialInsightsProps {
  stats: TenantCalculations[];
}

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({ stats }) => {
  const totalCollected = stats.reduce((acc, curr) => acc + (Number(curr.totalPaid) || 0), 0);
  const totalOutstanding = stats.reduce((acc, curr) => acc + (Number(curr.balanceDue) || 0), 0);
  const totalProjected = totalCollected + totalOutstanding;
  
  const collectionRate = totalProjected > 0 
    ? Math.round((totalCollected / totalProjected) * 100) 
    : 0;

  const collectedWidth = totalProjected > 0 ? (totalCollected / totalProjected) * 100 : 0;
  const outstandingWidth = totalProjected > 0 ? (totalOutstanding / totalProjected) * 100 : 0;

  return (
    <div className="mt-10 mb-6 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
            Financial Insights
          </h3>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Portfolio Performance & Efficiency
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Collection Rate</span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{collectionRate}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* The Graph */}
        <div className="relative pt-2">
          <div className="flex mb-3 items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="text-emerald-500">Collected Income</span>
            <span className="text-rose-500">Outstanding Balance</span>
          </div>
          <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${collectedWidth}%` }} 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out"
            />
            <div 
              style={{ width: `${outstandingWidth}%` }} 
              className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000 ease-out"
            />
          </div>
          <div className="flex mt-3 items-center justify-between font-black text-slate-900 dark:text-slate-100 tracking-tight">
            <span className="text-sm">{formatCurrency(totalCollected)}</span>
            <span className="text-sm">{formatCurrency(totalOutstanding)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gross Projected Revenue</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(totalProjected)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Efficiency Delta</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {totalOutstanding > 0 ? `-${formatCurrency(totalOutstanding)}` : 'Full Recovery'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
