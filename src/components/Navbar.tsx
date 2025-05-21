// Navbar component
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNotificationContext } from '../contexts/NotificationProvider';
import type { InAppNotification } from '../contexts/NotificationProvider';

interface NavbarProps {
  activeTab: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab }) => {
  const [userName, setUserName] = useState<string>('User');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  
  // Use our notification context
  const notificationContext = useNotificationContext();
  const notifications = notificationContext?.notifications || [];
  const unreadCount = notificationContext?.unreadCount || 0;
  const markAsRead = notificationContext?.markAsRead || (() => {});
  const markAllAsRead = notificationContext?.markAllAsRead || (() => {});
  
  useEffect(() => {
    // Set current date
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString('en-US', options));
    
    // Check for locally saved profile image
    const savedProfileImage = localStorage.getItem('profileImage');
    const savedUserName = localStorage.getItem('userName');
    
    // Fetch user from Firebase Auth
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Get display name or email as fallback, first check localStorage
        setUserName(savedUserName || user.displayName || user.email?.split('@')[0] || 'User');
        
        // Get user photo if available - first check localStorage, then Firebase
        if (savedProfileImage) {
          setUserPhoto(savedProfileImage);
        } else if (user.photoURL) {
          setUserPhoto(user.photoURL);
        }
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Toggle notification modal
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Notification Modal Component
  const NotificationModal = () => {
    if (!showNotifications) return null;
    
    return (
      <div className="absolute right-0 mt-2 w-80 bg-blue-200 dark:bg-gray-800 rounded-md shadow-xl py-1 z-20 max-h-96 overflow-y-auto border border-gray-100 dark:border-gray-700 notification-modal">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Notifications ({notifications.length})</h3>
          {unreadCount > 0 && (
            <button 
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
            <div className="mb-2">📬</div>
            <div>No notifications</div>
          </div>
        ) : (
          <>
            <div className="max-h-64 overflow-auto">
              {notifications.map((notification: InAppNotification) => (
                <div 
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 ${notification.read ? 'bg-white dark:bg-gray-800 opacity-70' : 'bg-blue-50 dark:bg-blue-900'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <p className={`text-sm ${notification.read ? 'font-normal' : 'font-medium'} dark:text-white`}>{notification.title ? `${notification.title}: ` : ''}{notification.message}</p>
                    {!notification.read && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full mt-1 flex-shrink-0 ml-2"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-center">
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                View all notifications
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.querySelector('.notification-modal');
      if (modal && !modal.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-sm z-10 dark:text-white transition-colors duration-200">
      <div className="flex justify-between items-center px-4 py-4">
        <div>
          {activeTab === 'home' ? (
            <div>
              <h1 className="text-lg font-semibold dark:text-white">Hello, {userName}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentDate}</p>
            </div>
          ) : (
            <h1 className="text-lg font-semibold capitalize dark:text-white">{activeTab}</h1>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button 
              className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer"
              onClick={toggleNotifications}
            >
              <i className="fas fa-bell text-gray-500 dark:text-gray-400"></i>
              
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationModal />
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            {userPhoto ? (
              <img 
                src={userPhoto} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-xs font-semibold">
                {userName.split(' ').map(name => name[0]).join('').toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
