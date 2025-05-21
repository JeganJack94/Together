// Notification Handler Service
// This service handles showing notifications with multiple fallbacks to ensure delivery

type NotificationOptions = {
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
};

// Check if the browser supports notifications
const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  
  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

// Get current notification permission
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  
  return Notification.permission;
};

// Send a notification with multiple fallbacks to ensure delivery
export const sendNotification = async (
  title: string, 
  options: NotificationOptions = {}
): Promise<boolean> => {
  console.log(`Attempting to send notification: ${title}`);
  
  // If notifications aren't supported, fall back to alert
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    alert(`${title}: ${options.body || ''}`);
    return false;
  }
  
  // Check if we have permission
  const permission = Notification.permission;
  
  if (permission === 'denied') {
    console.warn('Notification permission denied');
    alert(`${title}: ${options.body || ''}`);
    return false;
  }
  
  if (permission === 'default') {
    // Request permission
    const newPermission = await requestNotificationPermission();
    if (newPermission !== 'granted') {
      console.warn('Notification permission request rejected');
      alert(`${title}: ${options.body || ''}`);
      return false;
    }
  }
  
  // Enhanced options for better visibility
  const enhancedOptions = {
    ...options,
    requireInteraction: true, // Keep notification visible until user interacts with it
    icon: options.icon || '/logo192.png',
    tag: options.tag || `notification-${Date.now()}`, // Unique tag to prevent duplicates
  };
  
  try {
    // Try multiple approaches to ensure delivery
    
    // 1. Try the standard Notification API
    new Notification(title, enhancedOptions);
    
    // Add sound effect
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.warn('Could not play notification sound:', err));
    } catch (err) {
      console.warn('Sound playback not supported:', err);
    }
    
    // 2. Try to use the Service Worker API if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          ...enhancedOptions,
          // Add additional service worker notification options
          // but use type assertion to avoid TypeScript errors
        } as NotificationOptions & { vibrate?: number[] });
      } catch (err) {
        console.warn('Service Worker notification failed:', err);
      }
    }
    
    console.log('Notification successfully sent');
    return true;
    
  } catch (error) {
    console.error('Failed to show notification:', error);
    
    // Last resort fallback
    alert(`${title}: ${options.body || ''}`);
    return false;
  }
};