import React, { useState, useContext, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AuthContext } from '../contexts/AuthContext';

interface AddExpenseModalProps {
  tripId: string;
  onClose: () => void;
  onExpenseAdded: () => void;
}

const expenseCategories = [
  { name: 'Food', icon: 'fa-utensils', color: 'bg-orange-500' },
  { name: 'Transport', icon: 'fa-car', color: 'bg-blue-500' },
  { name: 'Accommodation', icon: 'fa-hotel', color: 'bg-purple-500' },
  { name: 'Activities', icon: 'fa-hiking', color: 'bg-green-500' },
  { name: 'Shopping', icon: 'fa-shopping-bag', color: 'bg-pink-500' },
  { name: 'Other', icon: 'fa-ellipsis-h', color: 'bg-gray-500' }
];

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  tripId,
  onClose,
  onExpenseAdded
}) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState('You');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<string[]>(['You']);

  useEffect(() => {
    if (!user?.uid || !tripId) return;

    const fetchTripMembers = async () => {
      try {
        const tripDocRef = doc(db, `users/${user.uid}/trips/${tripId}`);
        const tripDoc = await getDoc(tripDocRef);
        if (tripDoc.exists()) {
          const tripData = tripDoc.data();
          interface TripMember {
            name: string;
            [key: string]: unknown;
          }
          const memberNames = (tripData.members as TripMember[] | undefined)?.map((m) => m.name) || [];
          setMembers(['You', ...memberNames.filter((name: string) => name !== 'You')]);
        }
      } catch (error) {
        console.error('Error fetching trip members:', error);
      }
    };

    fetchTripMembers();
  }, [user?.uid, tripId]);

  const handleAddExpense = async () => {
    if (!title || !amount || amount <= 0 || !category || !paidBy) {
      alert('Please fill all required fields (title, amount, category, and paid by).');
      return;
    }

    setLoading(true);

    try {
      const selectedCategory = expenseCategories.find(c => c.name === category);
      const expensesRef = collection(db, `users/${user?.uid}/trips/${tripId}/expenses`);
      await addDoc(expensesRef, {
        title,
        amount: Number(amount),
        category,
        description,
        paidBy,
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
        members: 1,
        userId: user?.uid || '',
        icon: selectedCategory?.icon || 'fa-ellipsis-h',
      });

      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Expense</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Paid By */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Paid By</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {members.map((member, index) => {
              const isSelected = paidBy === member;
              // Generate consistent color based on member name
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
              // Check if member is defined before accessing charCodeAt
              const colorIndex = member === 'You' ? 0 : (member && typeof member === 'string' ? 
                (member.charCodeAt(0) % (colors.length - 1)) + 1 : 
                (index % (colors.length - 1)) + 1);
              const bgColor = colors[colorIndex];
              
              return (
                <div
                  key={index}
                  onClick={() => setPaidBy(member)}
                  className={`cursor-pointer px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                    isSelected 
                      ? `${bgColor} text-white ring-2 ring-offset-2 ring-${bgColor.replace('bg-', '')}`
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-white bg-opacity-30' : bgColor}`}>
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white'}`}>
                      {member && typeof member === 'string' ? member.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{member || 'Unknown'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you spend on?"
          />
        </div>

        {/* Amount */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500 dark:text-gray-400">₹</span>
            <input
              type="number"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Category</label>
          <div className="grid grid-cols-3 gap-3">
            {expenseCategories.map((cat) => (
              <div
                key={cat.name}
                className={`flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all ${
                  category === cat.name
                    ? 'bg-blue-50 dark:bg-blue-900 border-2 border-blue-500'
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setCategory(cat.name)}
              >
                <div className={`w-12 h-12 ${cat.color} rounded-full flex items-center justify-center mb-2`}>
                  <i className={`fas ${cat.icon} text-white text-lg`}></i>
                </div>
                <span className="text-xs font-medium dark:text-white">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description - Optional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description (Optional)</label>
          <textarea
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any additional details..."
            rows={2}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-medium text-white hover:opacity-90 transition-opacity flex items-center justify-center"
            onClick={handleAddExpense}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <i className="fas fa-plus-circle mr-2"></i>
            )}
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;