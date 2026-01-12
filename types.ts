
export type PaymentStatus = 'Paid' | 'Late' | 'Overdue' | 'Pending';
export type RentFrequency = 'Weekly' | 'Monthly';

export interface Tenant {
  id: string;
  name: string;
  monthlyRent: number;
  frequency: RentFrequency;
  dueDay?: number; // Day of the month (1-31)
  dueDayOfWeek?: number; // 0 (Sun) - 6 (Sat)
  phone?: string;
  startDate: string; // ISO string - when rent starts accruing
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  datePaid: string; // ISO string
  amountPaid: number;
  note?: string;
}

export interface AppState {
  tenants: Tenant[];
  payments: PaymentRecord[];
}

export interface TenantCalculations {
  tenant: Tenant;
  status: PaymentStatus;
  nextDueDate: Date;
  totalRentExpected: number;
  totalPaid: number;
  balanceDue: number;
  daysLate: number;
  history: PaymentRecord[];
}
