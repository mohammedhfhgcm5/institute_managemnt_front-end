import { PaymentStatus } from './common.types';

export interface Payment {
  id: number;
  studentId: number;
  academicYear: string;
  amount: number;
  discount: number;
  finalAmount?: number;
  status: PaymentStatus;
  dueDate: string;
  paymentDate?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  studentId: number;
  academicYear: string;
  amount: number;
  discount?: number;
  status?: PaymentStatus;
  dueDate: string;
  paymentDate?: string;
  notes?: string;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {}

export interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  totalPartial: number;
}
