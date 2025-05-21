// Profile page for Trip Planner & Expense Tracker
import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { getAuth, updateProfile, updatePassword } from 'firebase/auth';
import { AuthContext } from '../contexts/AuthContext';

// Define Trip interface for type safety
interface Trip {
  id?: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  expenses?: Array<{ amount?: string | number }>;
}

interface ProfileStats {
  totalTrips: number;
  activeTrips: number;
  totalSpent: string;
}

interface ProfileProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Profile: React.FC<ProfileProps> = ({ darkMode, toggleDarkMode }) => {
  const db = getFirestore();
  // Use AuthContext for user
  const { user: authUser } = useContext(AuthContext);
  const auth = getAuth();

  // Use the notifications hook
  const { sendNotification, permission, enabled } = useNotifications();

  // State for user info
  const [user, setUser] = useState<{ displayName: string; email: string; photoURL?: string } | null>(null);
  
  // State for image upload
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // State for profile statistics
  const [stats, setStats] = useState<ProfileStats>({
    totalTrips: 0,
    activeTrips: 0,
    totalSpent: '₹0'
  });

  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal for Security (update username & password)
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');

  // Modal for FAQ
  const [showFAQ, setShowFAQ] = useState(false);

  // Modal for User Manual
  const [showUserManual, setShowUserManual] = useState(false);

  // Use the full notification hook capabilities
  const { toggleNotifications } = useNotifications();
  
  // Notification toggle - combine browser permission with user preference
  const [notificationEnabled, setNotificationEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationEnabled');
    return saved === null ? true : saved === 'true';
  });
  
  // Effect to update localStorage when user preference changes
  useEffect(() => {
    localStorage.setItem('notificationEnabled', String(notificationEnabled));
  }, [notificationEnabled]);
  
  // Handle notification toggle with proper permission request
  const handleNotificationToggle = async () => {
    // If turning on notifications, check permissions
    if (!notificationEnabled) {
      await toggleNotifications();
      setNotificationEnabled(true);
    } else {
      // Just update the user preference
      setNotificationEnabled(false);
    }
  };

  // Function to fetch profile statistics
  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use user from AuthContext
      const currentUser = authUser;
      if (!currentUser || !currentUser.uid) {
        setStats({ totalTrips: 0, activeTrips: 0, totalSpent: '₹0' });
        setIsLoading(false);
        return;
      }
      // Fetch from users/(userId)/trips/
      const tripsCollectionRef = collection(db, `users/${currentUser.uid}/trips`);
      const tripsSnapshot = await getDocs(tripsCollectionRef);
      let totalTrips = 0;
      let activeTrips = 0;
      let totalSpentAmount = 0;
      tripsSnapshot.forEach((doc) => {
        const tripData = doc.data() as Trip;
        totalTrips++;
        if (tripData.endDate && new Date(tripData.endDate) > new Date()) {
          activeTrips++;
        }
        if (tripData.expenses && Array.isArray(tripData.expenses)) {
          tripData.expenses.forEach((expense: { amount?: string | number }) => {
            if (expense.amount !== undefined && !isNaN(Number(expense.amount))) {
              totalSpentAmount += parseFloat(String(expense.amount));
            }
          });
        }
      });
      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      });
      const formattedAmount = formatter.format(totalSpentAmount);
      setStats({
        totalTrips,
        activeTrips,
        totalSpent: formattedAmount
      });
      setIsLoading(false);
    } catch {
      setStats({ totalTrips: 0, activeTrips: 0, totalSpent: '₹0' });
      setIsLoading(false);
    }
  }, [authUser, db]);

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // Check for saved preferences on mount
  useEffect(() => {
    // Only send the notification if user has notifications enabled in their preferences
    if (notificationEnabled) {
      // Add a small delay to ensure data is loaded
      const timer = setTimeout(() => {
        sendNotification('Welcome back!', {
          body: 'Your trip data has been loaded successfully.',
          icon: '/favicon.ico'
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [sendNotification, notificationEnabled]);

  // Sync user info from Firebase Auth and localStorage
  useEffect(() => {
    // Check for locally saved profile image
    const savedProfileImage = localStorage.getItem('profileImage');
    
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || 'No email provided',
          // Use locally saved image first, then fall back to Firebase photo if available
          photoURL: savedProfileImage || firebaseUser.photoURL || undefined
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Update display name in Firebase Auth and local state
  const handleUpdateProfile = async () => {
    setSecurityMessage('');
    try {
      if (auth.currentUser && newDisplayName) {
        await updateProfile(auth.currentUser, { displayName: newDisplayName });
        setUser((prev) => prev ? { ...prev, displayName: newDisplayName } : prev);
        
        // Also save to localStorage for persistence
        localStorage.setItem('userName', newDisplayName);
        
        setSecurityMessage('Username updated successfully!');
      }
    } catch {
      setSecurityMessage('Failed to update username.');
    }
  };
  const handleChangePassword = async () => {
    setSecurityMessage('');
    try {
      if (auth.currentUser && newPassword) {
        await updatePassword(auth.currentUser, newPassword);
        setSecurityMessage('Password changed successfully!');
      }
    } catch {
      setSecurityMessage('Failed to change password.');
    }
  };

  // Handle profile image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const selectedFile = files[0];
    
    // Start upload
    if (auth.currentUser) {
      setImageUploadLoading(true);
      try {
        // Read the file as data URL (base64)
        const reader = new FileReader();
        
        reader.onload = () => {
          const dataUrl = reader.result as string;
          
          // Save to localStorage
          localStorage.setItem('profileImage', dataUrl);
          
          // Update user profile (only updating local state, not Firebase)
          // Update local state
          setUser(prev => prev ? {...prev, photoURL: dataUrl} : null);
          
          setImageUploadLoading(false);
          
          sendNotification('Success', {
            body: 'Profile picture updated successfully',
            icon: '/favicon.ico'
          });
        };
        
        reader.onerror = () => {
          throw new Error('Failed to read file');
        };
        
        reader.readAsDataURL(selectedFile);
      } catch {
        sendNotification('Error', {
          body: 'Failed to update profile picture',
          icon: '/favicon.ico'
        });
        setImageUploadLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 px-4 w-full max-w-md mx-auto bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-200">
      {/* Profile Header */}
      <div className="flex flex-col items-center mt-6 mb-8">
        <div 
          className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-3 cursor-pointer relative"
          onClick={handleImageClick}
        >
          {isLoading ? (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          ) : user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-3xl font-semibold">
              {user?.displayName ? user.displayName.split(' ').map((name: string) => name[0]).join('').toUpperCase() : 'U'}
            </span>
          )}
          
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          {/* Upload overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <i className="fas fa-camera text-white text-xl"></i>
          </div>
          
          {/* Loading indicator */}
          {imageUploadLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <h2 className="text-xl font-semibold dark:text-white">
          {isLoading ? 
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div> : 
            (user?.displayName || 'User')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          {isLoading ? 
            <span className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 mt-1 inline-block"></span> : 
            (user?.email || 'No email provided')}
        </p>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 text-center transition-colors duration-200">
          {isLoading ? (
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
          ) : (
            <p className="text-2xl font-semibold mb-1 dark:text-white">{stats.totalTrips}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Trips</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 text-center transition-colors duration-200">
          {isLoading ? (
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
          ) : (
            <p className="text-2xl font-semibold mb-1 dark:text-white">{stats.activeTrips}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">Active Trips</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 text-center transition-colors duration-200">
          {isLoading ? (
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
          ) : (
            <p className="text-2xl font-semibold mb-1 dark:text-white">{stats.totalSpent}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
        </div>
      </div>
      
      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-4 transition-colors duration-200">
        <h3 className="font-semibold dark:text-white mb-2">Settings</h3>
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm dark:text-white flex items-center"><i className="fas fa-moon text-gray-400 mr-2"></i>Dark Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" checked={darkMode} onChange={toggleDarkMode} />
            <span
              className={`w-10 h-6 flex items-center rounded-full border transition-colors duration-200 ${darkMode ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500' : 'bg-gray-200 border-gray-300'}`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`}
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
              ></span>
            </span>
          </label>
        </div>
        {/* Notification Toggle */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm dark:text-white flex items-center">
            <i className="fas fa-bell text-gray-400 mr-2"></i>
            Notifications
          </span>
          <div className="flex items-center">
            {notificationEnabled && !enabled && permission === 'denied' ? (
              <span className="text-xs text-yellow-500 dark:text-yellow-400 mr-2">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Blocked by browser
              </span>
            ) : null}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" checked={notificationEnabled} onChange={handleNotificationToggle} />
              <span
                className={`w-10 h-6 flex items-center rounded-full border transition-colors duration-200 ${notificationEnabled ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500' : 'bg-gray-200 border-gray-300'}`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${notificationEnabled ? 'translate-x-4' : 'translate-x-0'}`}
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
                ></span>
              </span>
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm dark:text-white flex items-center"><i className="fas fa-user-shield text-gray-400 mr-2"></i>Security</span>
          <span className="text-xs text-blue-600 cursor-pointer dark:text-blue-400" onClick={() => setShowSecurityModal(true)}>Update</span>
        </div>
        {/* FAQ */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm dark:text-white flex items-center"><i className="fas fa-question-circle text-gray-400 mr-2"></i>FAQ</span>
          <span className="text-xs text-blue-600 cursor-pointer dark:text-blue-400" onClick={() => setShowFAQ(true)}>View</span>
        </div>
        {/* User Manual */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm dark:text-white flex items-center"><i className="fas fa-book text-gray-400 mr-2"></i>User Manual</span>
          <span className="text-xs text-blue-600 cursor-pointer dark:text-blue-400" onClick={() => setShowUserManual(true)}>Read</span>
        </div>
      </div>
      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h4 className="font-semibold mb-4 dark:text-white">Update Profile</h4>
            <input type="text" placeholder="New Username" value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} className="w-full mb-2 p-2 rounded border dark:bg-gray-800 dark:text-white" />
            <button onClick={handleUpdateProfile} className="w-full mb-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded">Update Username</button>
            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mb-2 p-2 rounded border dark:bg-gray-800 dark:text-white" />
            <button onClick={handleChangePassword} className="w-full mb-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded">Change Password</button>
            {securityMessage && <div className="text-center text-sm text-green-600 dark:text-green-400 mb-2">{securityMessage}</div>}
            <button onClick={() => setShowSecurityModal(false)} className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded">Close</button>
          </div>
        </div>
      )}
      {/* FAQ Modal */}
      {showFAQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h4 className="font-semibold mb-4 dark:text-white">FAQ</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-200 list-disc pl-5 space-y-2">
              <li>How do I add a trip? <br />Use the Add button at the bottom to create a new trip.</li>
              <li>How do I track expenses? <br />Go to the Expenses tab and add your expenses for each trip.</li>
              <li>How do I enable notifications? <br />Toggle the Notifications switch in Settings.</li>
              <li>How do I change my password? <br />Open Security in Settings and use the Change Password option.</li>
              <li>How do I logout? <br />Use the Logout button at the bottom of this page.</li>
            </ul>
            <button onClick={() => setShowFAQ(false)} className="w-full mt-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded">Close</button>
          </div>
        </div>
      )}
      {/* User Manual Modal */}
      {showUserManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h4 className="font-semibold mb-4 dark:text-white">User Manual</h4>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
              Welcome to the Trip Planner & Expense Tracker User Manual. Here you will find information on how to use the app effectively.
            </p>
            <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">Getting Started</h5>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
              To get started, create an account or login using your existing credentials. Once logged in, you can start adding trips and tracking your expenses.
            </p>
            <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">Adding a Trip</h5>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
              To add a trip, navigate to the Trips section and click on the "Add Trip" button. Fill in the trip details such as title, destination, start date, and end date.
            </p>
            <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">Tracking Expenses</h5>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
              To track expenses, go to the Expenses tab within a trip and enter your expenses. You can add details like amount, category, and date for each expense.
            </p>
            <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">Managing Notifications</h5>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
              To manage notifications, visit the Settings page. Here you can enable or disable notifications and adjust other preferences.
            </p>
            <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">Security Settings</h5>
            <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
              For security settings, go to the Security section in Settings. You can update your username and change your password from there.
            </p>
            <button onClick={() => setShowUserManual(false)} className="w-full mt-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded">Close</button>
          </div>
        </div>
      )}
      {/* Minimal spacer before logout button */}
      <div className="flex-none h-2"></div>
      {/* Logout Button */}
      <button 
        onClick={() => {
          if (user && auth) {
            auth.signOut().then(() => {
              // Only send notification if enabled
              if (notificationEnabled) {
                sendNotification('Logged out successfully', {
                  body: 'You have been signed out. See you later!',
                  icon: '/favicon.ico'
                });
              }
            });
          }
        }}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center mt-4 transition-colors duration-200">
        <i className="fas fa-sign-out-alt mr-2"></i> Logout
      </button>

      {/* Copyright Footer */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6 mb-2">
        © {new Date().getFullYear()} WinTech. All rights reserved.
      </div>
    </div>
  );
};

export default Profile;
