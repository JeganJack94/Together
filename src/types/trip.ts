// Trip related types

// Define the FirestoreTimestamp interface for Firestore timestamp objects
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface TripType {
  id: string;
  name: string;
  description?: string;
  startDate: Date | string | FirestoreTimestamp | unknown; // More specific types
  endDate: Date | string | FirestoreTimestamp | unknown;
  dateRange?: string;
  budget?: number;
  spent?: number;
  totalBudget?: number;
  members?: number | Array<{ id: string; name?: string; email?: string; isOwner?: boolean }>;
  image?: string;
  userId?: string;
  createdBy?: string;
  status?: string;
  createdAt?: Date | string | FirestoreTimestamp | unknown;
  updatedAt?: Date | string | FirestoreTimestamp | unknown;
  // Additional fields can be added as needed
  // Updated to ensure totalBudget field is properly defined
}