import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { TripType } from '../types/trip';

// Fetch all trips for a specific user
export const fetchTrips = async (userId: string | undefined): Promise<TripType[]> => {
  if (!userId) return [];
  try {
    const tripsRef = collection(db, `users/${userId}/trips`);
    const snapshot = await getDocs(tripsRef);
    const trips = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        dateRange: data.startDate && data.endDate ? formatDateRange(data.startDate, data.endDate) : '',
        spent: data.spent ?? 0,
        budget: data.budget ?? 0,
        members: data.members ?? [],
        image: data.image || '',
        status: data.status || '',
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      } as TripType;
    });
    return trips;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

// Add a new trip
export const addTrip = async (userId: string, tripData: Omit<TripType, 'id' | 'createdAt' | 'updatedAt'>): Promise<TripType> => {
  try {
    const tripsRef = collection(db, `users/${userId}/trips`);
    
    const newTripData = {
      ...tripData,
      spent: 0, // Initial spent is 0
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    console.log('Adding trip to Firestore:', newTripData);
    const docRef = await addDoc(tripsRef, newTripData);
    console.log('Trip added with ID:', docRef.id);
    
    return {
      id: docRef.id,
      ...newTripData,
      dateRange: formatDateRange(newTripData.startDate, newTripData.endDate),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as TripType;
  } catch (error) {
    console.error('Error adding trip:', error);
    throw error;
  }
};

// Update an existing trip
export const updateTrip = async (userId: string, tripData: Partial<TripType> & { id: string }): Promise<void> => {
  try {
    const { id, ...data } = tripData;
    const tripRef = doc(db, `users/${userId}/trips`, id);
    
    await updateDoc(tripRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

// Delete a trip
export const deleteTrip = async (userId: string, tripId: string): Promise<void> => {
  try {
    const tripRef = doc(db, `users/${userId}/trips`, tripId);
    await deleteDoc(tripRef);
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

// Fetch a single trip by ID
export const fetchTrip = async (userId: string, tripId: string): Promise<TripType> => {
  try {
    const tripRef = doc(db, 'users', userId, 'trips', tripId);
    const tripSnap = await getDoc(tripRef);
    
    if (!tripSnap.exists()) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripSnap.data();
    return {
      id: tripSnap.id,
      ...tripData
    } as TripType;
  } catch (error) {
    console.error('Error fetching trip:', error);
    throw error;
  }
};

// Helper function to format date range
const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};