// Home page for Trip Planner & Expense Tracker
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { fetchTrips, deleteTrip } from '../services/tripService';
import type { TripType } from '../types/trip';
import AddTrip from './AddTrip';
import TripDetails from './TripDetails';
import { toast } from 'react-hot-toast';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase'; // Make sure this path is correct for your firebase config

// Extend the TripType with budget tracking properties
interface ExtendedTripType extends TripType {
  percentSpent: number;
  remaining: number;
}

const Home: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<ExtendedTripType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<ExtendedTripType | null>(null);
  const [showTripDetailsModal, setShowTripDetailsModal] = useState(false);

  // Raw fetch trips function removed as it's no longer needed

  const loadTrips = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const userTrips = await fetchTrips(user.uid);
      
      // For each trip, load the expenses to calculate spent amount
      const enhancedTrips = await Promise.all(userTrips.map(async (trip) => {
        // Ensure we have a valid budget value - similar to Expenses.tsx
        let budget = 0;
        
        // First try totalBudget, which should be the single source of truth
        if ('totalBudget' in trip && trip.totalBudget !== null && trip.totalBudget !== undefined) {
          budget = Number(trip.totalBudget);
        }
        // Fall back to budget property if needed
        else if ('budget' in trip && trip.budget !== null && trip.budget !== undefined) {
          budget = Number(trip.budget);
        }
        
        // Get expenses for this trip from the proper collection path
        let spent = 0;
        try {
          if (trip.id) {
            // Use the same expenses path as in the Expenses.tsx page
            const expensesRef = collection(db, `users/${user.uid}/trips/${trip.id}/expenses`);
            const expensesSnapshot = await getDocs(expensesRef);
            
            // Calculate total spent
            spent = expensesSnapshot.docs.reduce((sum, doc) => {
              const expenseData = doc.data();
              return sum + Number(expenseData.amount || 0);
            }, 0);
          }
        } catch {
          // Silent error handling
        }
        
        // Calculate percentage spent and remaining budget exactly like in Expenses.tsx
        const percentSpent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
        const remaining = budget - spent;
        
        return {
          ...trip,
          budget,
          totalBudget: budget, // Use consistent value for both fields
          spent,
          percentSpent,
          remaining
        };
      }));
      
      // Set the enhanced trips with all budget information
      setTrips(enhancedTrips);      } catch {
      toast.error('Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadTrips();
  }, [user, navigate, loadTrips]);

  const handleEditTrip = (trip: TripType | ExtendedTripType) => {
    // If it's already an ExtendedTripType, use it directly
    // Otherwise, add the missing budget properties with defaults
    const extendedTrip: ExtendedTripType = 'percentSpent' in trip ? 
      trip as ExtendedTripType : 
      {
        ...trip,
        percentSpent: 0,
        remaining: 0
      };
    setSelectedTrip(extendedTrip);
    setShowTripDetailsModal(true);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        if (!user?.uid) {
          toast.error('You must be logged in to delete a trip');
          return;
        }
        await deleteTrip(user.uid, tripId);
        toast.success('Trip deleted successfully');
        loadTrips();
      } catch {
        toast.error('Failed to delete trip');
      }
    }
  };

  // Timestamp interface for Firestore timestamps
  interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
  }


  // Format dates properly for display in the UI
  const formatDateForDisplay = (date: Date | string | number | FirestoreTimestamp): string => {
    if (!date) return 'Unknown';
    
    let dateObj: Date;
    
    if (typeof date === 'object' && 'seconds' in date) {
      // It's a Firestore Timestamp
      dateObj = new Date(date.seconds * 1000);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    // Format as MM/DD/YYYY
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    });
  };
  
  // Process trips to ensure proper date formatting and budget calculations before rendering
  const processTripsBeforeRendering = () => {
    return trips.map(trip => {
      // Ensure the trip always has the correct budget and expense properties
      // We don't need to recalculate budget values since they are already set in loadTrips
      
      // If trip needs date formatting, ensure we do that while preserving budget data
      if (trip.dateRange === 'Invalid Date - Invalid Date' || !trip.dateRange) {
        const startFormatted = formatDateForDisplay(trip.startDate as string | number | Date | FirestoreTimestamp);
        const endFormatted = formatDateForDisplay(trip.endDate as string | number | Date | FirestoreTimestamp);
        return {
          ...trip,
          dateRange: `${startFormatted} - ${endFormatted}`
        };
      }
      
      return trip;
    });
  };
  

  // Categorize trips based on current date
  // Using a fixed date for development/testing purposes (May 21, 2025 as seen in the UI)
  // This helps ensure consistent categorization regardless of when the code runs
  const today = new Date('2025-05-21');
  // Uncomment the line below for production use with actual current date
  // const today = new Date();

  // Update our categorizeTrips function to work with the processed trips containing valid date strings
  const categorizeTrips = () => {
    const active: ExtendedTripType[] = [];
    const upcoming: ExtendedTripType[] = [];
    const history: ExtendedTripType[] = [];

    // Use the processed trips with proper date formatting and budget calculations
    const tripsToProcess = processTripsBeforeRendering() as ExtendedTripType[];
    
    tripsToProcess.forEach(trip => {
      if (!trip.startDate || !trip.endDate) {
        // If dates are missing, skip categorization
        return;
      }
      
      // Convert dates to JavaScript Date objects for comparison
      let startDate: Date;
      let endDate: Date;
      
      try {
        if (trip.startDate && typeof trip.startDate === 'object' && 'seconds' in trip.startDate) {
          // If it's a Firestore Timestamp
          const timestamp = trip.startDate as FirestoreTimestamp;
          startDate = new Date(timestamp.seconds * 1000);
        } else {
          // For any other format, try direct conversion
          startDate = new Date(String(trip.startDate));
        }
        
        if (trip.endDate && typeof trip.endDate === 'object' && 'seconds' in trip.endDate) {
          // If it's a Firestore Timestamp
          const timestamp = trip.endDate as FirestoreTimestamp;
          endDate = new Date(timestamp.seconds * 1000);
        } else {
          // For any other format, try direct conversion
          endDate = new Date(String(trip.endDate));
        }
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          // If dates are invalid after conversion, skip categorization
          // Try to parse from the formatted dateRange as a fallback
          if (trip.dateRange) {
            const [startStr, endStr] = trip.dateRange.split(' - ');
            if (startStr && endStr) {
              startDate = new Date(startStr);
              endDate = new Date(endStr);
              
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return; // Still invalid, skip this trip
              }
            } else {
              return; // Invalid dateRange format, skip this trip
            }
          } else {
            return; // No dateRange to fallback on, skip this trip
          }
        }
        
        // Compare dates only (ignoring time) to ensure trips on today's date are properly categorized
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        if ((todayDateOnly >= startDateOnly && todayDateOnly <= endDateOnly) || 
            startDateOnly.getTime() === todayDateOnly.getTime()) {
          active.push(trip);
        } else if (todayDateOnly < startDateOnly) {
          upcoming.push(trip);
        } else {
          history.push(trip);
        }
      } catch {
        // Silent error handling for date processing
      }
    });
    
    return { active, upcoming, history };
  };

  const { active: activeTrips, upcoming: upcomingTrips, history: tripHistory } = categorizeTrips();

  // Filter trips by search query (case-insensitive)
  const filteredActiveTrips = activeTrips.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUpcomingTrips = upcomingTrips.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTripHistory = tripHistory.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-16 pt-2 bg-gray-50 dark:bg-gray-900 dark:text-white min-h-screen w-full max-w-md mx-auto flex flex-col transition-colors duration-200">
      {/* Search Bar and Add Trip Button */}
      <div className="mb-4 px-2 flex">
        <div className="relative flex-1 mr-2">
          <input
            type="text"
            placeholder="Search trips..."
            className="w-full py-2.5 px-4 pr-10 bg-white dark:bg-gray-800 rounded-xl text-sm focus:outline-none border-none shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            inputMode="search"
            autoComplete="off"
            aria-label="Search trips"
          />
          <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
        </div>
        <button
          onClick={() => setShowAddTripModal(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full py-2 px-3 shadow-sm hover:bg-blue-600"
        >
          <i className="fas fa-plus mr-1"></i> 
        </button>
      </div>

      {/* Active Trips */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold pl-2 mb-2 text-left dark:text-white">Active Trips</h2>
        <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide px-2" tabIndex={0} aria-label="Active Trips List">
          <div className="flex space-x-4 min-w-full pb-1">
            {filteredActiveTrips.map((trip) => (
              <div 
                key={trip.id} 
                className="min-w-[85vw] max-w-[85vw] sm:min-w-[290px] sm:max-w-[290px] flex-shrink-0 snap-center bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                onClick={() => handleEditTrip(trip)}
              >
                <div className="relative h-28 w-full overflow-hidden">
                  <img 
                    src={trip.image || '/default-trip.jpg'} 
                    alt={trip.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-white dark:bg-gray-800 text-xs px-2 py-0.5 rounded-full font-medium flex items-center shadow-sm dark:text-white">
                      <i className="fas fa-user-group text-blue-500 mr-1"></i>
                      {/* Support both array and number for members */}
                      {Array.isArray(trip.members) ? trip.members.length : trip.members} members
                    </span>
                  </div>
                  <div className="absolute top-2 left-2 flex space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTrip(trip);
                      }}
                      className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm text-blue-500 hover:text-blue-700"
                    >
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip(trip.id);
                      }}
                      className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm text-red-500 hover:text-red-700"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
                
                {/* Trip details section - Make sure this is visible */}
                <div className="p-3">
                  <h3 className="font-medium text-base mb-0.5 truncate dark:text-white">{trip.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-2">
                    <i className="far fa-calendar mr-1"></i>
                    {trip.dateRange}
                  </p>
                  
                  {/* Budget display with progress bar */}
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">Budget</span>
                    <span className="font-semibold dark:text-white">₹{(trip.budget || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                      style={{ width: `${trip.percentSpent || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{(trip.percentSpent || 0).toFixed(0)}% spent</span>
                    <span>₹{(trip.remaining || 0).toLocaleString()} remaining</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredActiveTrips.length === 0 && (
              <div className="text-gray-400 text-sm px-4 py-8">No active trips found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Trips */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold pl-2 mb-2 text-left dark:text-white">Upcoming Trips</h2>
        <div className="px-2 space-y-3">
          {filteredUpcomingTrips.map((trip) => (
            <div 
              key={trip.id} 
              onClick={() => handleEditTrip(trip)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 flex items-center cursor-pointer transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div 
                className="w-14 h-14 rounded-xl overflow-hidden mr-3 bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              >
                <img src={trip.image || '/default-trip.jpg'} alt={trip.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base mb-0.5 truncate dark:text-white">{trip.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center truncate">
                  <i className="far fa-calendar mr-1"></i>
                  {trip.dateRange}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-semibold mb-0.5 dark:text-white">₹{(trip.budget || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
              </div>
              <div className="ml-2 flex flex-col space-y-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTrip(trip);
                  }}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <i className="fas fa-edit text-xs"></i>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTrip(trip.id);
                  }}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          ))}
          {filteredUpcomingTrips.length === 0 && (
            <div className="text-gray-400 dark:text-gray-500 text-sm px-4 py-4">No upcoming trips found.</div>
          )}
        </div>
      </div>

      {/* Trip History */}
      <div>
        <div className="flex justify-between items-center px-2 mb-2">
          <h2 className="text-lg font-semibold text-left dark:text-white">Trip History</h2>
          <button className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center space-x-1 active:scale-95 transition-transform">
            <span>View All</span>
            <i className="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
        <div className="px-2 space-y-3">
          {filteredTripHistory.map((trip) => (
            <div 
              key={trip.id} 
              onClick={() => handleEditTrip(trip)} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 flex items-center cursor-pointer transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div 
                className="w-14 h-14 rounded-xl overflow-hidden mr-3 bg-gray-50 dark:bg-gray-700 flex items-center justify-center"
              >
                {trip.image ? (
                  <img src={trip.image} alt={trip.name} className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-mountain text-gray-400 dark:text-gray-500 text-xl"></i>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base mb-0.5 truncate dark:text-white">{trip.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center truncate">
                  <i className="far fa-calendar mr-1"></i>
                  {trip.dateRange}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-semibold mb-0.5 dark:text-white">₹{(trip.spent || 0).toLocaleString()}</p>
                <p className="text-xs text-green-600 dark:text-green-400">{(trip.percentSpent || 0).toFixed(0)}% spent</p>
              </div>
              <div className="ml-2 flex flex-col space-y-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTrip(trip);
                  }}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <i className="fas fa-edit text-xs"></i>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTrip(trip.id);
                  }}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          ))}
          {filteredTripHistory.length === 0 && (
            <div className="text-gray-400 dark:text-gray-500 text-sm px-4 py-4">No trip history found.</div>
          )}
        </div>
      </div>

      {/* AddTrip Modal for creating a new trip or editing existing trip */}
      {showAddTripModal && (
        <AddTrip 
          onClose={() => { 
            setShowAddTripModal(false); 
            setSelectedTrip(null);
            loadTrips(); 
          }} 
        />
      )}

      {/* TripDetails Modal for viewing/editing trip details */}
      {showTripDetailsModal && selectedTrip && (
        <TripDetails 
          tripId={selectedTrip.id}
          onClose={() => {
            setShowTripDetailsModal(false);
            setSelectedTrip(null);
          }}
          onSave={loadTrips}
        />
      )}
    </div>
  );
};

export default Home;
