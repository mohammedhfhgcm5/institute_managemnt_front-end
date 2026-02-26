import { ExpenseCategory } from './common.types';

export interface Expense {
  id: number;
  createdBy?: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  receiptNumber?: string;
  attachments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  receiptNumber?: string;
  attachments?: string;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

export interface ExpenseStats {
  totalExpenses: number;
  byCategory: Record<ExpenseCategory, number>;
  monthlyTrend: { month: string; amount: number }[];
}
