
export type MealStatus = 'Delivered' | 'Skipped' | 'Pending';
export type MealType = 'Lunch' | 'Dinner';

export interface MealLog {
  date: string; // ISO String
  status: MealStatus;
  type: MealType;
}

export interface PaymentLog {
  date: string;
  amount: number;
  tiffins: number;
}

export interface TiffinSubscription {
  id: string;
  totalCredits: number;
  remainingCredits: number;
  logs: MealLog[];
  payments: PaymentLog[];
  lastPaymentDate: string;
}

export type AppTab = 'dashboard' | 'calendar' | 'history' | 'settings' | 'ai-hub' | 'text' | 'image' | 'video' | 'live';
