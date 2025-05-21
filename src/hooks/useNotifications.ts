import { useState, useEffect } from 'react';

interface UseNotificationReturn {
  enabled: boolean;
  permission: NotificationPermission | null;
  toggleNotifications: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

/**
 * Custom hook to handle browser notifications
 */
export const useNotifications = (): UseNotificationReturn => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  // Check permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      setEnabled(currentPermission === 'granted');
      
      // If we have "default" permission (not asked yet), let's request it
      if (currentPermission === 'default') {
        // We'll request permission when the user interacts with the page
        const requestPermissionOnInteraction = () => {
          Notification.requestPermission().then(newPermission => {
            setPermission(newPermission);
            setEnabled(newPermission === 'granted');
            // Remove listeners after first interaction
            document.removeEventListener('click', requestPermissionOnInteraction);
          });
        };
        
        document.addEventListener('click', requestPermissionOnInteraction, { once: true });
      }
    }
  }, []);

  // Toggle notifications permission
  const toggleNotifications = async (): Promise<void> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported in this environment');
      return;
    }

    try {
      // If not enabled, request permission
      if (!enabled) {
        const newPermission = await Notification.requestPermission();
        setPermission(newPermission);
        setEnabled(newPermission === 'granted');
        
        // If user declined, inform them how to enable it
        if (newPermission === 'denied') {
          alert('Notification permission denied. Please enable notifications in your browser settings to receive alerts.');
        }
      } else {
        // If already enabled, just toggle the preference
        setEnabled(false);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  // Send a notification if permissions are granted
  const sendNotification = (title: string, options?: NotificationOptions): void => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window
    ) {
      if (permission === 'granted') {
        // Try to use service worker if available (for PWA support)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) {
              reg.showNotification(title, options).catch((err) => {
                console.error('Service worker notification error:', err);
                // Fallback to direct Notification
                new Notification(title, options);
              });
            } else {
              // No registration, fallback
              new Notification(title, options);
            }
          }).catch((err) => {
            console.error('Service worker getRegistration error:', err);
            new Notification(title, options);
          });
        } else {
          // No service worker, fallback
          new Notification(title, options);
        }
      } else if (permission === 'default') {
        // Permission not asked yet, let's request and then try to send
        Notification.requestPermission().then(newPermission => {
          setPermission(newPermission);
          setEnabled(newPermission === 'granted');
          if (newPermission === 'granted') {
            // Try again after permission granted
            sendNotification(title, options);
          } else {
            alert('Notification permission was not granted. Please enable notifications in your browser settings.');
            console.log('Notification permission was not granted');
          }
        });
      } else {
        alert('Notifications are blocked. Please enable them in your browser settings.');
        console.log('Notification permission denied previously');
      }
    } else {
      alert('Notifications are not supported in this environment.');
      console.warn('Notifications not supported in this environment');
    }
  };

  return {
    enabled,
    permission,
    toggleNotifications,
    sendNotification
  };
};