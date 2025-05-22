// Reports page for Trip Planner & Expense Tracker
import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  members?: number;
  budget: number;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  date?: string;
}

const Reports: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [dailySpending, setDailySpending] = useState<Record<string, number>>({});
  const [tripMembers, setTripMembers] = useState<number>(4); // Default to 4 if not available
  const [budget, setBudget] = useState<number>(0); // Remove default, fetch from trip
  const reportRef = useRef<HTMLDivElement>(null);

  const formatDate = (timestamp: { seconds: number; nanoseconds: number } | string): string => {
    if (typeof timestamp === 'string') {
      const dateObj = new Date(timestamp);
      if (isNaN(dateObj.getTime())) return timestamp;
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Update trip selection and persist to localStorage
  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    localStorage.setItem('selectedTripId', tripId);
  };

  useEffect(() => {
    if (!user?.uid) return;

    const fetchTrips = async () => {
      const tripsRef = collection(db, 'users', user.uid, 'trips');
      const snapshot = await getDocs(tripsRef);
      const tripsList = snapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure members is always a valid number
        let members = 4;
        if (typeof data.members === 'number') {
          members = data.members;
        } else if (typeof data.members === 'string' && !isNaN(Number(data.members))) {
          members = Number(data.members);
        }
        return {
          id: doc.id,
          name: data.name,
          startDate: data.startDate, // store raw value
          endDate: data.endDate,     // store raw value
          members,
          budget: parseFloat(data.totalBudget) || 0,
        };
      });
      setTrips(tripsList);
      
      // Get saved trip from localStorage first
      const savedTripId = localStorage.getItem('selectedTripId');
      
      // Check if saved trip exists in the current trips list
      const savedTripExists = savedTripId && tripsList.some(t => t.id === savedTripId);
      
      // If we have a saved trip that still exists, use it
      if (savedTripExists) {
        setSelectedTripId(savedTripId!);
        const selectedTrip = tripsList.find(trip => trip.id === savedTripId);
        if (selectedTrip) {
          setTripMembers(selectedTrip.members || 4);
          setBudget(selectedTrip.budget || 0);
        }
      } 
      // Otherwise, if we have trips available, select the first one
      else if (tripsList.length > 0) {
        setSelectedTripId(tripsList[0].id);
        setTripMembers(tripsList[0].members || 4);
        setBudget(tripsList[0].budget || 0);
        localStorage.setItem('selectedTripId', tripsList[0].id);
      }
    };

    fetchTrips();
  }, [user?.uid]);

  useEffect(() => {
    if (!selectedTripId || !user?.uid) return;

    // Update trip members and budget when trip selection changes
    const selectedTrip = trips.find(trip => trip.id === selectedTripId);
    if (selectedTrip) {
      const memberCount = selectedTrip.members || 4;
      setTripMembers(memberCount);
      setBudget(selectedTrip.budget || 0);
    }

    const fetchExpenses = async () => {
      const expensesRef = collection(db, `users/${user.uid}/trips/${selectedTripId}/expenses`);
      const snapshot = await getDocs(expensesRef);
      const expensesList = snapshot.docs.map(doc => {
        const data = doc.data();
        // Extract date portion only for grouping by day
        let dateStr = '';
        if (data.date) {
          if (typeof data.date === 'string') {
            // If it's already a string, extract just the date part (YYYY-MM-DD)
            dateStr = new Date(data.date).toISOString().split('T')[0];
          } else if (data.date.seconds) {
            // If it's a Firestore timestamp
            dateStr = new Date(data.date.seconds * 1000).toISOString().split('T')[0];
          }
        }
        return {
          id: doc.id,
          amount: Number(data.amount) || 0,
          category: data.category || 'Other',
          date: dateStr,
        };
      });
      setExpenses(expensesList);

      // Calculate daily spending - group strictly by day
      const dailySpendingMap: Record<string, number> = {};
      expensesList.forEach(expense => {
        if (expense.date) {
          // Ensure we're using just the date portion for grouping
          dailySpendingMap[expense.date] = (dailySpendingMap[expense.date] || 0) + expense.amount;
        }
      });
      setDailySpending(dailySpendingMap);
    };

    fetchExpenses();
  }, [selectedTripId, user?.uid, trips]);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget - totalSpent;
  const dailyAverage = (totalSpent / (Object.keys(dailySpending).length || 1)).toFixed(2);
  // Ensure tripMembers is always a valid number (not NaN or undefined)
  const perPerson = tripMembers && !isNaN(tripMembers) && tripMembers > 0 ? (totalSpent / tripMembers).toFixed(2) : "0.00";

  const expenseCategories = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        data: Object.values(expenseCategories),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const chartOptions = {
    cutout: '50%',
    plugins: {
      legend: {
        display: false // Hide default legend as we're creating our own
      }
    },
    maintainAspectRatio: true
  };

  // Handle sharing trip details
  const handleShareTrip = () => {
    // Find the selected trip
    const selectedTrip = trips.find(trip => trip.id === selectedTripId);
    if (!selectedTrip) return;
    
    // Create share text
    const categoryBreakdown = Object.entries(expenseCategories)
      .map(([category, amount]) => `${category}: ₹${amount.toFixed(2)}`)
      .join('\n');
      
    const shareText = `
Trip: ${selectedTrip.name}
Date: ${selectedTrip.startDate} - ${selectedTrip.endDate}
Members: ${tripMembers}
Budget: ₹${budget.toFixed(2)}
Total Spent: ₹${totalSpent.toFixed(2)}
Remaining: ₹${remaining.toFixed(2)}
Per Person: ₹${perPerson}

Expense Breakdown:
${categoryBreakdown}
    `.trim();
    
    if (navigator.share) {
      navigator.share({
        title: `Trip Details: ${selectedTrip.name}`,
        text: shareText
      }).catch(() => {});
    } else {
      // Fallback for browsers that don't support navigator.share
      try {
        navigator.clipboard.writeText(shareText);
        alert('Trip details copied to clipboard!');
      } catch {
        alert('Could not share trip details');
      }
    }
  };

  // Handle exporting report as PDF
  const handleExportPDF = () => {
    if (!reportRef.current) {
      alert("Could not generate PDF. Please try again.");
      return;
    }
    setTimeout(() => {
      html2canvas(reportRef.current as HTMLElement, { scale: 2 }).then((canvas) => {
        try {
          const imgData = canvas.toDataURL('image/jpeg', 0.9); // Using JPEG instead of PNG
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 295; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save(`trip_report_${selectedTripId}.pdf`);
        } catch {
          alert("Could not generate PDF. Please try again.");
        }
      }).catch(() => {
        alert("Could not generate PDF. Please try again.");
      });
    }, 500);
  };

  return (
    <div className="pb-20 px-0 w-full max-w-md mx-auto bg-gray-50 dark:bg-gray-900 dark:text-white min-h-screen transition-colors duration-200">
      {/* Trip Selector */}
      <div className="px-4 mb-6">
        <div className="relative transition-transform duration-300 hover:-translate-y-1">
          <select
            className="w-full appearance-none py-3 px-4 pr-10 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:outline-none border-none shadow-md hover:shadow-lg dark:text-white transition-shadow duration-300"
            value={selectedTripId}
            onChange={(e) => handleTripChange(e.target.value)}
          >
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name} ({formatDate(trip.startDate)} - {formatDate(trip.endDate)})
              </option>
            ))}
          </select>
          <i className="fas fa-chevron-down absolute right-4 top-3.5 text-gray-400 dark:text-gray-500"></i>
        </div>
      </div>
      {/* Expense Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg p-4 mx-4 mb-6 transform transition-all duration-300 hover:-translate-y-1">
        <h3 className="font-semibold mb-3 dark:text-white">Expense Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Spent</p>
            <p className="text-lg font-semibold dark:text-white">₹{totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-green-100 dark:bg-green-900 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
            <p className="text-lg font-semibold dark:text-white">₹{remaining.toFixed(2)}</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Daily Average</p>
            <p className="text-lg font-semibold dark:text-white">₹{dailyAverage}</p>
          </div>
          <div className="bg-orange-100 dark:bg-orange-900 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Per Person</p>
            <p className="text-lg font-semibold dark:text-white">₹{perPerson}</p>
          </div>
        </div>
      </div>
      {/* Expense Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg p-4 mx-4 mb-6 transform transition-all duration-300 hover:-translate-y-1">
        <h3 className="font-semibold mb-3 dark:text-white">Expense Breakdown</h3>
        <div className="w-full" style={{ maxWidth: '200px', height: '200px', margin: '0 auto' }}>
          <Pie data={chartData} options={{
            ...chartOptions,
            elements: {
              arc: {
                borderWidth: 0
              }
            }
          }} />
        </div>
        <div className="flex flex-wrap justify-center mt-4 gap-3">
          {Object.keys(expenseCategories).map((category, index) => (
            <div key={category} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[index % chartData.datasets[0].backgroundColor.length] }}></div>
              <span className="text-xs dark:text-gray-300">{category}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Daily Spending */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg p-4 mx-4 mb-6 transform transition-all duration-300 hover:-translate-y-1">
        <h3 className="font-semibold mb-3 dark:text-white">Daily Spending</h3>
        
        {Object.entries(dailySpending).length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No spending data available</p>
        ) : (
          Object.entries(dailySpending)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()) // Sort by date descending
            .map(([date, amount]) => {
              // Calculate percentage for the progress bar (max 100%)
              const maxSpending = Math.max(...Object.values(dailySpending));
              const spendingPercentage = (amount / maxSpending) * 100;
              return (
                <div key={date} className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm dark:text-gray-300">
                      {new Date(date).toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm font-semibold dark:text-white">₹{amount.toFixed(2)}</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${spendingPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
        )}
      </div>
      
      {/* Share Option */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg p-4 mx-4 mb-6 transform transition-all duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold dark:text-white">Share Trip Details</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => handleExportPDF()} 
              className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              title="Download as PDF">
              <i className="fas fa-file-pdf"></i>
            </button>
            <button 
              onClick={() => handleShareTrip()} 
              className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              title="Share trip details">
              <i className="fas fa-share-alt"></i>
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Share trip details and expense breakdown with your fellow travelers</p>
      </div>

      {/* Report Section for PDF export - positioned off-screen but not hidden */}
      <div ref={reportRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', backgroundColor: 'white' }}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Trip Report</h2>
          <div className="mb-4">
            <strong>Trip:</strong> {trips.find(trip => trip.id === selectedTripId)?.name}<br />
            <strong>Date:</strong> {formatDate(trips.find(trip => trip.id === selectedTripId)?.startDate || '')} - {formatDate(trips.find(trip => trip.id === selectedTripId)?.endDate || '')}<br />
            <strong>Members:</strong> {tripMembers}<br />
            <strong>Budget:</strong> ₹{budget.toFixed(2)}<br />
            <strong>Total Spent:</strong> ₹{totalSpent.toFixed(2)}<br />
            <strong>Remaining:</strong> ₹{remaining.toFixed(2)}<br />
            <strong>Per Person:</strong> ₹{perPerson}<br />
          </div>
          <h3 className="font-semibold mb-2">Expense Breakdown</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(expenseCategories).map(([category, amount], index) => (
              <div key={category} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartData.datasets[0].backgroundColor[index % chartData.datasets[0].backgroundColor.length] }}></div>
                <span className="text-sm">{category}: ₹{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ width: '400px', height: '300px', margin: '20px auto' }}>
            <Pie data={chartData} options={{ ...chartOptions, animation: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;