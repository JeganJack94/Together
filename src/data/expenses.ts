// Example data for expenses and helper functions

import { Timestamp } from 'firebase/firestore';

// Interface for expense type
export interface Expense {
  id?: string;
  tripId: string;
  amount: number;
  category: string;
  description: string;
  date: Timestamp;
  paidBy: string;
  paidByName?: string;
  splitWith: string[];
  receipt?: string; // URL for receipt image
  createdAt: Timestamp;
}

// Sample data for recent expenses
export const recentExpenses: Expense[] = [
  // This array will be populated from Firestore
];

// Function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Function to convert Firestore expense to local format
type FirestoreExpenseData = {
  tripId: string;
  amount: number;
  category: string;
  description: string;
  date: Timestamp;
  paidBy: string;
  paidByName?: string;
  splitWith?: string[];
  receipt?: string;
  createdAt: Timestamp;
};

type FirestoreExpenseDoc = {
  id: string;
  data: () => FirestoreExpenseData;
};

export const convertFirestoreExpense = (doc: FirestoreExpenseDoc): Expense => {
  const data = doc.data();
  return {
    id: doc.id,
    tripId: data.tripId,
    amount: data.amount,
    category: data.category,
    description: data.description,
    date: data.date,
    paidBy: data.paidBy,
    paidByName: data.paidByName,
    splitWith: data.splitWith || [],
    receipt: data.receipt,
    createdAt: data.createdAt
  };
};
