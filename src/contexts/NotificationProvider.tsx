import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
}

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  addNotification: (title: string, message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('inAppNotifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inAppNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title: string, message: string) => {
    setNotifications(prev => [
      { id: Date.now().toString(), title, message, read: false, timestamp: Date.now() },
      ...prev
    ]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
