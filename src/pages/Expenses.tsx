// Expenses page for Trip Planner & Expense Tracker
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { db} from '../config/firebase';
import { collection, query, onSnapshot, orderBy, doc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import AddExpenseModal from '../components/AddExpenseModal';
import ViewExpensesModal from '../components/ViewExpensesModal';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationContext } from '../contexts/NotificationProvider';

const expenseCategories = [
  { name: 'Food', icon: 'fa-utensils', color: 'bg-orange-500' },
  { name: 'Transport', icon: 'fa-car', color: 'bg-blue-500' },
  { name: 'Accommodation', icon: 'fa-hotel', color: 'bg-purple-500' },
  { name: 'Activities', icon: 'fa-hiking', color: 'bg-green-500' },
  { name: 'Shopping', icon: 'fa-shopping-bag', color: 'bg-pink-500' },
  { name: 'Other', icon: 'fa-ellipsis-h', color: 'bg-gray-500' }
];

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  trip: string;
  members: number;
  userId: string;
  icon?: string;
  description?: string;
  createdAt?: FirestoreTimestamp | null;
  paidBy?: string;
}

interface DropdownTrip {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

const Expenses: React.FC = () => {
  // Helper to get today's date string
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  // Helper to check and increment daily notification count
  const canSendNotificationToday = () => {
    const today = getTodayString();
    const countKey = `noti-count-${today}`;
    const count = Number(localStorage.getItem(countKey) || '0');
    if (count >= 10) return false;
    localStorage.setItem(countKey, String(count + 1));
    return true;
  };

  // Helper to check if a notification for a unique key was already sent
  const wasNotified = (key: string) => {
    return !!localStorage.getItem(key);
  };
  const markNotified = (key: string) => {
    localStorage.setItem(key, 'true');
  };

  const { user } = useContext(AuthContext);
  const notifications = useNotifications();
  const { addNotification } = useNotificationContext() || {};
  
  const [trips, setTrips] = useState<DropdownTrip[]>([]);
  const [trip, setTrip] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAllExpensesModal, setShowAllExpensesModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{show: boolean; expenseId: string; name: string} | null>(null);

  // Update trip selection and persist to localStorage
  const handleTripChange = (tripId: string) => {
    setTrip(tripId);
    localStorage.setItem('selectedTripId', tripId);
  };

  // Format dates properly for display
  const formatDateForDisplay = (date: Date | string | FirestoreTimestamp | undefined): string => {
    if (!date) return 'Unknown';

    let dateObj: Date;

    if (typeof date === 'object' && 'seconds' in date) {
      // Firestore Timestamp
      dateObj = new Date(date.seconds * 1000);
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return 'Invalid Date';
    }

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper function to get the color for a category
  const getColorForCategory = (categoryName: string): string => {
    const category = expenseCategories.find(cat => cat.name === categoryName);
    return category ? category.color : 'bg-gray-500';
  };

  // Format expense date for display
  const formatExpenseDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // Format: Apr 15, 2023, 3:45 PM
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate total spent
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining = budget - totalSpent;
  const percentSpent = budget > 0 ? Math.min(100, (totalSpent / budget) * 100) : 0;

  // Fetch trips for the user
  useEffect(() => {
    if (!user?.uid) return;

    const fetchTrips = async () => {
      const tripsRef = collection(db, 'users', user.uid, 'trips');
      const snapshot = await getDocs(tripsRef);
      const tripsList = snapshot.docs.map(doc => {
        const data = doc.data();
        let startDate: Date;
        let endDate: Date;

        if (data.startDate && typeof data.startDate === 'object' && 'seconds' in data.startDate) {
          startDate = new Date(data.startDate.seconds * 1000);
        } else {
          startDate = new Date(data.startDate);
        }

        if (data.endDate && typeof data.endDate === 'object' && 'seconds' in data.endDate) {
          endDate = new Date(data.endDate.seconds * 1000);
        } else {
          endDate = new Date(data.endDate);
        }

        return {
          id: doc.id,
          name: data.name,
          startDate,
          endDate,
        };
      });

      setTrips(tripsList);

      // Get saved trip from localStorage first
      const savedTripId = localStorage.getItem('selectedTripId');
      
      // Check if saved trip exists in the current trips list
      const savedTripExists = savedTripId && tripsList.some(t => t.id === savedTripId);
      
      // If we have a saved trip that still exists, use it
      if (savedTripExists) {
        setTrip(savedTripId!);
      } 
      // Otherwise, if we have trips available, select the first one
      else if (tripsList.length > 0) {
        // Only set the first trip as default if no trip is currently selected
        if (!trip) {
          setTrip(tripsList[0].id);
          localStorage.setItem('selectedTripId', tripsList[0].id);
        }
      }
    };

    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Fetch budget for selected trip
  useEffect(() => {
    if (!trip || !user?.uid) return;
    const tripDoc = doc(db, `users/${user.uid}/trips/${trip}`);
    getDoc(tripDoc).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBudget(Number(data.totalBudget) || 0); // Fetch totalBudget field
      } else {
        setBudget(0);
      }
    });
  }, [trip, user?.uid]);

  // Fetch expenses for selected trip
  useEffect(() => {
    if (!trip || !user?.uid) return;
    setLoading(true);
    const q = query(
      collection(db, `users/${user.uid}/trips/${trip}/expenses`),
      orderBy('createdAt', 'desc') // Use createdAt for ordering
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setExpenses(
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            amount: typeof data.amount === 'number' ? data.amount : Number(data.amount) || 0,
            category: data.category || 'Other',
            date: data.date || '',
            createdAt: data.createdAt || null,
            trip: data.trip || '',
            members: typeof data.members === 'number' ? data.members : 1,
            userId: data.userId || '',
            icon: data.icon || 'fa-ellipsis-h',
            paidBy: data.paidBy || 'You',
          } as Expense;
        })
      );
      setLoading(false);
    });
    return () => unsub();
  }, [trip, user?.uid]);

  // Notification logic for budget thresholds
  useEffect(() => {
    if (budget <= 0 || !trip) return;
    const tripName = trips.find(t => t.id === trip)?.name || 'Unknown Trip';
    const thresholds = [50, 60, 70, 80, 90, 100];
    thresholds.forEach((threshold) => {
      const notificationKey = `budget-threshold-${trip}-${threshold}`;
      const shouldNotify = Math.floor(percentSpent) >= threshold;
      if (shouldNotify && !wasNotified(notificationKey) && canSendNotificationToday()) {
        const notificationTitle = `Budget Alert for ${tripName}`;
        const notificationMessage = `You've used ${percentSpent.toFixed(0)}% of your budget (₹${totalSpent.toLocaleString()} of ₹${budget.toLocaleString()}).`;
        if (typeof notifications.sendNotification === 'function') {
          notifications.sendNotification(notificationTitle, {
            body: notificationMessage,
            icon: '/logo192.png',
            tag: `budget-threshold-${threshold}`,
            requireInteraction: true
          });
        }
        addNotification?.(notificationTitle, notificationMessage);
        markNotified(notificationKey);
      }
    });
  }, [budget, percentSpent, totalSpent, trip, trips, notifications, addNotification, canSendNotificationToday]);

  const handleExpenseAdded = () => {
    // Refresh expenses and budget overview after adding an expense
    setShowAddExpenseModal(false);
  };

  // Delete an expense
  const handleDeleteExpense = async (expenseId: string) => {
    if (!user?.uid || !trip) return;

    try {
      // Find the expense to get its title for the confirmation
      const expenseToDelete = expenses.find(e => e.id === expenseId);
      if (!expenseToDelete) return;

      // Show confirmation dialog
      setDeleteConfirmation({
        show: true, 
        expenseId,
        name: expenseToDelete.title || 'this expense'
      });
    } catch {
      setDeleteConfirmation(null);
    }
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!deleteConfirmation || !user?.uid || !trip) return;
    const notificationKey = `expense-deleted-${deleteConfirmation.expenseId}`;
    if (wasNotified(notificationKey) || !canSendNotificationToday()) {
      setDeleteConfirmation(null);
      return;
    }
    try {
      const expenseRef = doc(db, `users/${user.uid}/trips/${trip}/expenses/${deleteConfirmation.expenseId}`);
      await deleteDoc(expenseRef);
      if (typeof notifications.sendNotification === 'function') {
        notifications.sendNotification('Expense Deleted', {
          body: `"${deleteConfirmation.name}" has been deleted successfully.`
        });
      }
      addNotification?.('Expense Deleted', `"${deleteConfirmation.name}" has been deleted successfully.`);
      markNotified(notificationKey);
      setDeleteConfirmation(null);
    } catch {
      setDeleteConfirmation(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  return (
    <div className="pb-20 px-0 w-full max-w-md mx-auto bg-gray-50 dark:bg-gray-900 dark:text-white min-h-screen transition-colors duration-200">
      {/* Trip Selector */}
      <div className="px-4 mb-6">
        <div className="relative transition-transform duration-300 hover:-translate-y-1">
          <label htmlFor="trip-selector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Trip</label>
          <div className="relative">
            <select
              id="trip-selector"
              className="w-full appearance-none py-3 px-4 pr-10 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-lg dark:text-white transition-shadow duration-300"
              value={trip}
              onChange={e => handleTripChange(e.target.value)}
            >
              {trips.length === 0 && <option>No active trips</option>}
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({formatDateForDisplay(t.startDate)} - {formatDateForDisplay(t.endDate)})
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-4 top-3.5 text-gray-400 pointer-events-none"></i>
          </div>
        </div>
      </div>
      {/* Budget Overview */}
      <div className="px-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg p-4 transform transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold dark:text-white">Budget Overview</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ₹{totalSpent.toLocaleString()} / ₹{budget.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style={{ width: `${percentSpent}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{percentSpent.toFixed(0)}% spent</span>
            <span>₹{remaining.toLocaleString()} remaining</span>
          </div>
        </div>
      </div>
      {/* Expense Categories */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold px-4 mb-3 dark:text-white">Categories</h2>
        <div className="grid grid-cols-3 gap-3 px-4">
          {expenseCategories.map((category, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg p-3 flex flex-col items-center cursor-pointer transform transition-all duration-300 hover:-translate-y-1">
              <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center mb-2`}>
                <i className={`fas ${category.icon} text-white`}></i>
              </div>
              <span className="text-xs font-medium text-center whitespace-nowrap overflow-hidden text-ellipsis dark:text-white">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Expenses */}
      <div>
        <div className="flex justify-between items-center px-4 mb-3">
          <h2 className="text-lg font-semibold dark:text-white">Recent Expenses</h2>
          <button 
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
            onClick={() => setShowAllExpensesModal(true)}
          >
            View All
          </button>
        </div>
        <div className="px-4">
          {loading ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">No expenses found.</div>
          ) : expenses.slice(0, 4).map((expense) => (
            <div 
              key={expense.id} 
              className="bg-white dark:bg-gray-800 rounded-lg mb-3 overflow-hidden relative"
            >
              <div className="flex items-center p-3 w-full">
                <div className={`w-10 h-10 rounded-full ${getColorForCategory(expense.category)} flex items-center justify-center mr-3 flex-shrink-0`}>
                  <i className={`fas ${expense.icon || 'fa-ellipsis-h'} text-white`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm dark:text-white truncate">{expense.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {expense.category} • {new Date(expense.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}, {new Date(expense.date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-semibold dark:text-white">₹{Number(expense.amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{expense.paidBy || 'You'}</p>
                </div>
              </div>
              
              {/* Hidden delete button visible on swipe */}
              <div 
                className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center opacity-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteExpense(expense.id);
                }}
              >
                <i className="fas fa-trash-alt text-white"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Button */}
      <button
        className="fixed right-5 bottom-20 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
        onClick={() => setShowAddExpenseModal(true)}
      >
        <i className="fas fa-plus text-white text-xl"></i>
      </button>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <AddExpenseModal
          tripId={trip}
          onClose={() => setShowAddExpenseModal(false)}
          onExpenseAdded={handleExpenseAdded}
        />
      )}

      {/* View All Expenses Modal */}
      {showAllExpensesModal && (
        <ViewExpensesModal
          expenses={expenses}
          onClose={() => setShowAllExpensesModal(false)}
          formatExpenseDate={formatExpenseDate}
          getColorForCategory={getColorForCategory}
          tripName={trips.find(t => t.id === trip)?.name || 'Trip'}
          onDeleteExpense={handleDeleteExpense}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 max-w-sm mx-4 animate-fade-in-up shadow-xl">
            <h3 className="text-xl font-semibold mb-3 dark:text-white">Confirm Deletion</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-5">
              Are you sure you want to delete "{deleteConfirmation.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
