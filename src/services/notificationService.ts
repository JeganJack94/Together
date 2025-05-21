// Trip Notification Service
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { TripType } from '../types/trip';

export interface TripNotification {
  id: string;
  tripId: string;
  tripName: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'day-before' | 'trip-day' | 'trip-update' | 'trip-creation' | 'budget-threshold' | 'budget-overlimit';
}

// Now add the implementation of the functions we'll need

// Check for upcoming trips to create notifications
export const checkUpcomingTrips = async (userId: string): Promise<TripNotification[]> => {
  if (!userId) return [];
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const notifications: TripNotification[] = [];
    
    // Get all trips for the user
    const tripsRef = collection(db, `users/${userId}/trips`);
    const snapshot = await getDocs(tripsRef);
    
    snapshot.docs.forEach(doc => {
      const trip = doc.data();
      
      // Handle Firestore timestamp
      let startDate: Date;
      if (trip.startDate) {
        if (typeof trip.startDate === 'object' && 'seconds' in trip.startDate) {
          // It's a Firestore Timestamp
          startDate = new Date(trip.startDate.seconds * 1000);
        } else {
          // For any other format, try direct conversion
          startDate = new Date(String(trip.startDate));
        }
        
        // Reset hours to compare only dates
        startDate.setHours(0, 0, 0, 0);
        
        // Check if trip starts today
        if (startDate.getTime() === today.getTime()) {
          notifications.push({
            id: `trip-day-${doc.id}`,
            tripId: doc.id,
            tripName: trip.name || 'Upcoming Trip',
            message: `Your trip "${trip.name}" starts today!`,
            timestamp: new Date(),
            read: false,
            type: 'trip-day'
          });
        }
        
        // Check if trip starts tomorrow
        else if (startDate.getTime() === tomorrow.getTime()) {
          notifications.push({
            id: `day-before-${doc.id}`,
            tripId: doc.id,
            tripName: trip.name || 'Upcoming Trip',
            message: `Your trip "${trip.name}" starts tomorrow!`,
            timestamp: new Date(),
            read: false,
            type: 'day-before'
          });
        }
      }
    });
    
    return notifications;
    
  } catch (error) {
    console.error('Error checking upcoming trips:', error);
    return [];
  }
};

// Create notification for trip creation
export const createTripCreationNotification = (trip: TripType): TripNotification => {
  return {
    id: `trip-creation-${trip.id}-${Date.now()}`,
    tripId: trip.id,
    tripName: trip.name,
    message: `Trip "${trip.name}" has been created successfully!`,
    timestamp: new Date(),
    read: false,
    type: 'trip-creation'
  };
};

// Create notification for trip update
export const createTripUpdateNotification = (trip: TripType): TripNotification => {
  return {
    id: `trip-update-${trip.id}-${Date.now()}`,
    tripId: trip.id,
    tripName: trip.name,
    message: `Trip "${trip.name}" has been updated successfully!`,
    timestamp: new Date(),
    read: false,
    type: 'trip-update'
  };
};