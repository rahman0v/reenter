export type Currency = string;

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'upcoming';
export type PaymentMethod = 'card' | 'bank';
export type TransferMethod = 'bank_transfer' | 'online';

export interface Payment {
  id: string;
  property_name: string;
  counterparty_name: string;
  currency: Currency;
  amount: number;
  commission_amount: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  status: PaymentStatus;
  payment_method?: PaymentMethod;
  transfer_method?: TransferMethod;
  transfer_ref?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentMethodDetails {
  id: string;
  type: PaymentMethod;
  name: string;
  last4: string;
  expiry?: string;
  isDefault: boolean;
}

export type ViewMode = 'tenant' | 'landlord'; 