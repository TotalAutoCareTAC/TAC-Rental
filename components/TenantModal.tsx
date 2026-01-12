
import React, { useState } from 'react';
import { Tenant, RentFrequency } from '../types';

interface TenantModalProps {
  tenant?: Tenant | null;
  onClose: () => void;
  onSave: (tenant: Omit<Tenant, 'id'> & { id?: string }) => void;
}

const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

export const TenantModal: React.FC<TenantModalProps> = ({ tenant, onClose, onSave }) => {
  const [name, setName] = useState(tenant?.name || '');
  // Initialize as string to avoid leading zero issue
  const [rent, setRent] = useState<string>(tenant?.monthlyRent ? tenant.monthlyRent.toString() : '');
  const [frequency, setFrequency] = useState<RentFrequency>(tenant?.frequency || 'Monthly');
  const [dueDay, setDueDay] = useState<string>(tenant?.dueDay ? tenant.dueDay.toString() : '1');
  const [dueDayOfWeek, setDueDayOfWeek] = useState(tenant?.dueDayOfWeek ?? 1);
  const [phone, setPhone] = useState(tenant?.phone || '');
  const [startDate, setStartDate] = useState(tenant?.startDate || new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: tenant?.id,
      name,
      monthlyRent: Number(rent) || 0,
      frequency,
      dueDay: frequency === 'Monthly' ? (Number(dueDay) || 1) : undefined,
      dueDayOfWeek: frequency === 'Weekly' ? Number(dueDayOfWeek) : undefined,
      phone,
      startDate
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{tenant ? 'Edit Tenant' : 'New Tenant'}</h3>
          <button onClick={onClose} type="button" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="custom-scrollbar max-h-[80vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rent Start Date</label>
              <input 
                required
                type="date" 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all dark:text-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 mt-1">Rent begins accruing from this day.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Payment Frequency</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFrequency('Monthly')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${frequency === 'Monthly' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('Weekly')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${frequency === 'Weekly' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rent Price ($)</label>
                <input 
                  required
                  type="number" 
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all dark:text-white"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                />
              </div>

              <div>
                {frequency === 'Monthly' ? (
                  <>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Due Day (1-31)</label>
                    <input 
                      required
                      type="number"
                      min="1"
                      max="31"
                      placeholder="1"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all dark:text-white"
                      value={dueDay}
                      onChange={(e) => setDueDay(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Due Every</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all dark:text-white appearance-none"
                      value={dueDayOfWeek}
                      onChange={(e) => setDueDayOfWeek(Number(e.target.value))}
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contact Number</label>
              <input 
                type="tel" 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all dark:text-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234..."
              />
            </div>
          </div>
          
          <div className="px-6 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4 pb-10 sm:pb-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
            >
              {tenant ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
