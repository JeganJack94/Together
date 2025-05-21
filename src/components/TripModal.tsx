// Add Trip page for Trip Planner & Expense Tracker
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase'; // Adjust if your Firebase import path is different
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { expenseCategories, getEmptyCategoryBudgets } from '../data/categories';
import { uploadImage } from '../utils/imageUpload';
import type { Trip, TripMember } from '../data/trips';

const AddTrip: React.FC = () => {
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<{[key: string]: string}>(getEmptyCategoryBudgets());
  // State for managing members
  const [members, setMembers] = useState<TripMember[]>([]);
  // State for modal display
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  // State for new member and category
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newCategory, setNewCategory] = useState('');
  // State for visible categories (initially show only a subset)
  const [visibleCategories, setVisibleCategories] = useState<string[]>(['Food', 'Transport', 'Accommodation', 'Shopping']);
  
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Handle category budget changes
  const handleCategoryBudgetChange = (category: string, value: string) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Handle back button
  const handleBack = () => {
    navigate('/');
  };

  // Handle image file selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create trip in Firestore
  const handleCreateTrip = async () => {
    if (!currentUser) {
      setError('You must be logged in to create a trip');
      return;
    }
    if (!tripName) {
      setError('Trip name is required');
      return;
    }
    if (!startDate || !endDate) {
      setError('Both start and end dates are required');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      // Calculate total budget from category budgets
      const calculatedCategoryBudgets = Object.entries(categoryBudgets).reduce((acc, [category, amount]) => {
        if (amount) {
          acc[category] = parseFloat(amount);
        }
        return acc;
      }, {} as {[key: string]: number});
      // Create trip document using our Trip interface
      const tripMember: TripMember = {
        id: currentUser.uid,
        email: currentUser.email || '',
        isOwner: true
      };
      // Combine current user with any added members
      const allMembers = [tripMember, ...members];
      // Handle image upload if image is selected
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImage(image);
      }
      const tripData: Omit<Trip, 'id'> & { image?: string } = {
        name: tripName,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        totalBudget: budget ? parseFloat(budget) : 0,
        categoryBudgets: calculatedCategoryBudgets,
        members: allMembers,
        createdBy: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...(imageUrl ? { image: imageUrl } : {})
      };
      // Add to Firestore under the user's trips collection
      const tripsRef = collection(db, 'users', currentUser.uid, 'trips');
      await addDoc(tripsRef, tripData);
      navigate('/');
    } catch (err) {
      console.error('Error creating trip:', err);
      setError('Failed to create trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add member button click
  const handleAddMemberClick = () => {
    setShowMemberModal(true);
  };

  // Handle close member modal
  const handleCloseMemberModal = () => {
    setShowMemberModal(false);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  // Handle add member
  const handleAddMember = () => {
    if (!newMemberName) {
      setError('Member name is required');
      return;
    }

    // Add new member to members array
    const newMember: TripMember = {
      id: `temp-${Date.now()}`, // Temporary ID until we have real user IDs
      email: newMemberEmail || '', // Email is now optional
      name: newMemberName,
      isOwner: false
    };

    setMembers(prev => [...prev, newMember]);
    handleCloseMemberModal();
  };

  // Handle show category modal
  const handleShowCategoryModal = () => {
    setShowCategoryModal(true);
  };

  // Handle close category modal
  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setNewCategory('');
  };

  // Handle add custom category
  const handleAddCategory = () => {
    if (!newCategory) {
      setError('Category name is required');
      return;
    }

    // Check if category already exists
    if (visibleCategories.includes(newCategory)) {
      setError('This category already exists');
      return;
    }

    // Add new category to visible categories
    setVisibleCategories(prev => [...prev, newCategory]);
    
    // Initialize budget for new category
    setCategoryBudgets(prev => ({
      ...prev,
      [newCategory]: ''
    }));
    
    handleCloseCategoryModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-0 max-h-[90vh] flex flex-col">
        {/* Modal Header with Back Button */}
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <button onClick={handleBack} className="mr-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none">
            <i className="fas fa-arrow-left text-gray-600"></i>
          </button>
          <h2 className="text-lg font-semibold flex-1 text-center">Create New Trip</h2>
          <div className="w-8"></div> {/* Spacer for symmetry */}
        </div>
        
        {error && (
          <div className="mx-5 mt-3 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="p-5 overflow-y-auto flex-1">
          {/* Trip Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Trip Image</label>
            <div className="w-full h-40 bg-gray-100 rounded-xl flex flex-col items-center justify-center overflow-hidden relative">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} alt="Trip" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
                  >
                    <i className="fas fa-times text-red-500"></i>
                  </button>
                </div>
              ) : (
                <>
                  <i className="fas fa-camera text-gray-400 text-2xl mb-2"></i>
                  <label className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
            <input 
              type="text" 
              placeholder="e.g., Summer in Italy"
              className="w-full py-3 px-4 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
              value={tripName}
              onChange={e => setTripName(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget</label>
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Members</label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Current user */}
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">You</span>
              </div>
              
              {/* Added members */}
              {members.map((member, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full pr-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-1">
                    <span className="text-white text-xs">{member.name?.substring(0, 1) || member.email.substring(0, 1)}</span>
                  </div>
                  <span className="text-xs mr-1">{member.name || member.email}</span>
                </div>
              ))}
              
              {/* Add button */}
              <div 
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                onClick={handleAddMemberClick}
              >
                <i className="fas fa-plus text-gray-500 text-xs"></i>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Budget Categories</label>
              <button 
                type="button" 
                className="text-blue-600 text-sm flex items-center"
                onClick={handleShowCategoryModal}
              >
                <i className="fas fa-plus mr-1"></i> Add Category
              </button>
            </div>
            <div className="space-y-2">
              {/* Show only the visible categories */}
              {expenseCategories
                .filter(category => visibleCategories.includes(category.name))
                .map((category, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${category.color} rounded-full flex items-center justify-center mr-3`}>
                      <i className={`fas ${category.icon} text-white text-xs`}></i>
                    </div>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="relative w-24">
                    <span className="absolute left-2 top-2 text-gray-500 text-xs">₹</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full py-2 pl-6 pr-2 bg-white rounded-lg text-xs focus:outline-none border-none shadow-sm"
                      value={categoryBudgets[category.name]}
                      onChange={e => handleCategoryBudgetChange(category.name, e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              {/* Custom categories that aren't in expenseCategories */}
              {visibleCategories
                .filter(categoryName => !expenseCategories.some(cat => cat.name === categoryName))
                .map((categoryName, index) => (
                <div key={`custom-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-tag text-white text-xs"></i>
                    </div>
                    <span className="text-sm">{categoryName}</span>
                  </div>
                  <div className="relative w-24">
                    <span className="absolute left-2 top-2 text-gray-500 text-xs">₹</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full py-2 pl-6 pr-2 bg-white rounded-lg text-xs focus:outline-none border-none shadow-sm"
                      value={categoryBudgets[categoryName]}
                      onChange={e => handleCategoryBudgetChange(categoryName, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={handleCreateTrip}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-md disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      </div>
      
      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-4 w-80">
            <h3 className="text-lg font-semibold mb-4">Add Member</h3>
            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full py-2 px-3 bg-gray-50 rounded-lg text-sm focus:outline-none border border-gray-200"
                placeholder="Member name"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Email <span className="text-gray-400">(optional)</span></label>
              <input
                type="email"
                className="w-full py-2 px-3 bg-gray-50 rounded-lg text-sm focus:outline-none border border-gray-200"
                placeholder="member@example.com"
                value={newMemberEmail}
                onChange={e => setNewMemberEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseMemberModal}
                className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-4 w-80">
            <h3 className="text-lg font-semibold mb-4">Add Category</h3>
            
            {/* Custom category input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Custom Category</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full py-2 px-3 bg-gray-50 rounded-lg text-sm focus:outline-none border border-gray-200"
                  placeholder="e.g., Souvenirs"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                />
                {newCategory && (
                  <button 
                    onClick={handleAddCategory} 
                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-700"
                  >
                    <i className="fas fa-plus-circle"></i>
                  </button>
                )}
              </div>
            </div>
            
            {/* Available categories list */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Available Categories</label>
              <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg border border-gray-200">
                {expenseCategories
                  .filter(category => !visibleCategories.includes(category.name))
                  .map((category, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setVisibleCategories(prev => [...prev, category.name]);
                        setCategoryBudgets(prev => ({
                          ...prev,
                          [category.name]: ''
                        }));
                      }}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 ${category.color} rounded-full flex items-center justify-center mr-2`}>
                          <i className={`fas ${category.icon} text-white text-xs`}></i>
                        </div>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <i className="fas fa-plus text-gray-400"></i>
                    </div>
                  ))}
                {expenseCategories.filter(category => !visibleCategories.includes(category.name)).length === 0 && (
                  <div className="p-3 text-center text-gray-500 text-sm">No more categories available</div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleCloseCategoryModal}
                className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTrip;
