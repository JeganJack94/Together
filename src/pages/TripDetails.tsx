import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { fetchTrip, updateTrip } from '../services/tripService';
import type { TripType } from '../types/trip';
import { toast } from 'react-hot-toast';

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

interface TripDetailsProps {
  tripId: string;
  onClose: () => void;
  onSave: () => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ tripId, onClose, onSave }) => {
  const { user } = useContext(AuthContext);
  const [trip, setTrip] = useState<TripType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [image, setImage] = useState('');

  const loadTrip = useCallback(async () => {
    if (!user?.uid || !tripId) return;
    setIsLoading(true);
    try {
      const tripData = await fetchTrip(user.uid, tripId);
      setTrip(tripData);

      // Initialize form fields
      setName(tripData.name || '');
      
      // Handle start date
      if (tripData.startDate) {
        let startDateObj: Date;
        if (typeof tripData.startDate === 'object' && 'seconds' in tripData.startDate) {
          const timestamp = tripData.startDate as unknown as FirestoreTimestamp;
          startDateObj = new Date(timestamp.seconds * 1000);
        } else {
          startDateObj = new Date(String(tripData.startDate));
        }
        if (!isNaN(startDateObj.getTime())) {
          setStartDate(startDateObj.toISOString().split('T')[0]);
        }
      }
      
      // Handle end date
      if (tripData.endDate) {
        let endDateObj: Date;
        if (typeof tripData.endDate === 'object' && 'seconds' in tripData.endDate) {
          const timestamp = tripData.endDate as unknown as FirestoreTimestamp;
          endDateObj = new Date(timestamp.seconds * 1000);
        } else {
          endDateObj = new Date(String(tripData.endDate));
        }
        if (!isNaN(endDateObj.getTime())) {
          setEndDate(endDateObj.toISOString().split('T')[0]);
        }
      }

      setBudget(tripData.budget?.toString() || '');
      setImage(tripData.image || '');
    } catch {
      toast.error('Failed to load trip details');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !tripId) return;
    
    try {
      setIsLoading(true);
      // Create a timestamp for dates
      const startTimestamp = new Date(startDate).toISOString();
      const endTimestamp = new Date(endDate).toISOString();
      
      const updatedTripData = {
        id: tripId,
        name,
        startDate: startTimestamp,  // Use ISO string format
        endDate: endTimestamp,      // Use ISO string format
        budget: parseFloat(budget) || 0,
        image
      };
      
      await updateTrip(user.uid, updatedTripData);
      toast.success('Trip updated successfully');
      setIsEditing(false);
      onSave();
    } catch {
      toast.error('Failed to update trip');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !trip) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col w-full max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-0 max-h-[90vh] flex flex-col">
        {/* Modal Header with Back Button */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <button onClick={onClose} className="mr-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none">
            <i className="fas fa-arrow-left text-gray-600"></i>
          </button>
          <h2 className="text-lg font-semibold flex-1 text-center">
            {isEditing ? 'Edit Trip' : 'Trip Details'}
          </h2>
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="w-8 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <i className={`fas ${isEditing ? 'fa-eye' : 'fa-edit'} text-gray-600`}></i>
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
                <input 
                  type="text" 
                  className="w-full py-3 px-4 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full py-3 px-4 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    className="w-full py-3 px-4 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">₹</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full py-3 pl-8 pr-4 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input 
                  type="text" 
                  className="w-full py-3 px-4 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-md disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <>
              {trip && (
                <div>
                  <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                    {trip.image ? (
                      <img src={trip.image} alt={trip.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-mountain text-gray-400 text-4xl"></i>
                      </div>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{trip.name}</h1>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <i className="far fa-calendar mr-2"></i>
                    {trip.dateRange}
                  </p>
                  <div className="bg-gray-50 p-4 rounded-xl mb-4">
                    <h3 className="font-medium mb-2">Budget</h3>
                    <p className="text-xl font-bold text-blue-600">₹{trip.budget}</p>
                    {trip.spent && (
                      <>
                        <div className="flex justify-between text-sm text-gray-600 mt-2 mb-1">
                          <span>Spent</span>
                          <span>₹{trip.spent} / ₹{trip.budget}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: trip.budget ? `${((trip.spent ?? 0) / trip.budget) * 100}%` : '0%' }}
                          ></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetails;