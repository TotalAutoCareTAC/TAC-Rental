
import { Tenant, PaymentRecord, TenantCalculations, PaymentStatus } from '../types';

export const formatCurrency = (amount: number): string => {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(safeAmount);
};

export const calculateTenantData = (
  tenant: Tenant,
  payments: PaymentRecord[],
  currentDate: Date = new Date()
): TenantCalculations => {
  const start = new Date(tenant.startDate || new Date());
  if (isNaN(start.getTime())) {
    start.setTime(new Date().getTime());
  }
  start.setHours(0, 0, 0, 0);
  
  const now = new Date(currentDate);
  now.setHours(0, 0, 0, 0);

  let periods = 0;
  let nextDueDate = new Date(start);

  const rentAmount = Number(tenant.monthlyRent) || 0;

  // Calculate total expected rent based on periods passed since start
  if (tenant.frequency === 'Monthly') {
    while (nextDueDate <= now) {
      periods++;
      nextDueDate = new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1, tenant.dueDay || 1);
    }
  } else {
    // Weekly
    while (nextDueDate <= now) {
      periods++;
      nextDueDate.setDate(nextDueDate.getDate() + 7);
    }
  }

  const totalRentExpected = periods * rentAmount;
  const tenantPayments = (payments || [])
    .filter(p => p.tenantId === tenant.id)
    .sort((a, b) => new Date(b.datePaid).getTime() - new Date(a.datePaid).getTime());
  
  const totalPaid = tenantPayments.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
  const balanceDue = Math.max(0, totalRentExpected - totalPaid);

  // Status and Days Late logic
  let status: PaymentStatus = 'Paid';
  let daysLate = 0;

  if (balanceDue > 0) {
    status = 'Overdue';
    let lastUnpaidDueDate = new Date(start);
    let count = 0;
    while (count < periods) {
      if (totalPaid < (count + 1) * rentAmount) {
        break;
      }

      if (tenant.frequency === 'Monthly') {
        lastUnpaidDueDate = new Date(lastUnpaidDueDate.getFullYear(), lastUnpaidDueDate.getMonth() + 1, tenant.dueDay || 1);
      } else {
        lastUnpaidDueDate.setDate(lastUnpaidDueDate.getDate() + 7);
      }
      count++;
    }
    
    const diff = now.getTime() - lastUnpaidDueDate.getTime();
    daysLate = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }

  return {
    tenant,
    status,
    nextDueDate,
    totalRentExpected,
    totalPaid,
    balanceDue,
    daysLate,
    history: tenantPayments
  };
};

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
