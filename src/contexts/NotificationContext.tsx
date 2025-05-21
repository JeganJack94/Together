import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { checkUpcomingTrips, createTripCreationNotification, createTripUpdateNotification } from '../services/notificationService';
import type { TripNotification } from '../services/notificationService';
import type { TripType } from '../types/trip';

interface NotificationContextType {
  notifications: TripNotification[];
  unreadCount: number;
  addNotification: (notification: TripNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  checkForUpcomingTripNotifications: () => Promise<void>;
  addTripCreationNotification: (trip: TripType) => void;
  addTripUpdateNotification: (trip: TripType) => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<TripNotification[]>([]);
  const { user } = useAuth();

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add a new notification
  const addNotification = (notification: TripNotification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  // Check for upcoming trip notifications
  const checkForUpcomingTripNotifications = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const tripNotifications = await checkUpcomingTrips(user.uid);
      
      // Only add new notifications (check by tripId and type)
      const existingNotifications = new Set(
        notifications.map(n => `${n.tripId}-${n.type}`)
      );
      
      const newNotifications = tripNotifications.filter(
        n => !existingNotifications.has(`${n.tripId}-${n.type}`)
      );
      
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    } catch (error) {
      console.error('Error checking for upcoming trip notifications:', error);
    }
  }, [user?.uid, notifications]);

  // Add trip creation notification
  const addTripCreationNotification = useCallback((trip: TripType) => {
    const notification = createTripCreationNotification(trip);
    addNotification(notification);
  }, []);

  // Add trip update notification
  const addTripUpdateNotification = useCallback((trip: TripType) => {
    const notification = createTripUpdateNotification(trip);
    addNotification(notification);
  }, []);

  // Check for upcoming trips on mount and every hour
  useEffect(() => {
    if (user?.uid) {
      checkForUpcomingTripNotifications();
      
      // Check for upcoming trips every hour
      const interval = setInterval(() => {
        checkForUpcomingTripNotifications();
      }, 60 * 60 * 1000); // 1 hour
      
      return () => clearInterval(interval);
    }
  }, [user?.uid, checkForUpcomingTripNotifications]);


  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      checkForUpcomingTripNotifications,
      addTripCreationNotification,
      addTripUpdateNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};