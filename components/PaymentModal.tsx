
import React, { useState } from 'react';
import { TenantCalculations } from '../types';
import { formatCurrency } from '../utils/calculations';

interface PaymentModalProps {
  data: TenantCalculations;
  onClose: () => void;
  onSave: (amount: number, date: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ data, onClose, onSave }) => {
  // Use string state to allow for truly empty input field
  const [amount, setAmount] = useState<string>(data.balanceDue > 0 ? data.balanceDue.toString() : '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount >= 0) {
      onSave(numericAmount, date);
    } else if (amount === '') {
      // Treat empty as 0 or alert user
      onSave(0, date);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Log Payment</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tenant</p>
             <p className="text-slate-800 dark:text-slate-100 font-bold">{data.tenant.name}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 tracking-tight">Amount Received ($)</label>
            <input 
              type="number" 
              placeholder="e.g. 150"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all dark:text-white text-lg font-bold"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-2">Remaining balance: {formatCurrency(data.balanceDue)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 tracking-tight">Payment Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all dark:text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="px-6 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4 pb-10 sm:pb-6">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  );
};
