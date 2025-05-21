import { useState, useEffect } from 'react';

interface NotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  silent?: boolean;
  requireInteraction?: boolean;
}

interface UseNotificationsReturn {
  enabled: boolean;
  permission: NotificationPermission;
  toggleNotifications: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => Promise<boolean>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  
  const isSupported = 'Notification' in window;
  const enabled = permission === 'granted';

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const toggleNotifications = async (): Promise<boolean> => {
    if (enabled) {
      // Already enabled, nothing to do
      return true;
    }
    return requestPermission();
  };

  const sendNotification = async (title: string, options?: NotificationOptions): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      console.error('Notifications not supported or permission not granted');
      // Fallback to alert
      alert(`${title}: ${options?.body || ''}`);
      return false;
    }

    try {
      // Create and show the notification
      const notification = new Notification(title, {
        ...options,
        requireInteraction: true, // Keep notification until user interacts with it
      });
      
      console.log('Notification created:', notification);
      
      // Play notification sound to get user attention
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.5;
        await audio.play();
      } catch (err) {
        // Sound not supported or failed to load - continue without sound
        console.warn('Could not play notification sound', err);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      // Fallback to alert
      alert(`${title}: ${options?.body || ''}`);
      return false;
    }
  };

  return {
    enabled,
    permission,
    toggleNotifications,
    sendNotification
  };
};