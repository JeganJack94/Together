// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState } from 'react';
import * as echarts from 'echarts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Active trips data
  const activeTrips = [
    {
      id: 1,
      name: 'Paris Getaway',
      dateRange: 'May 20 - May 27, 2025',
      budget: 3000,
      spent: 1250,
      members: 4,
      image: 'https://readdy.ai/api/search-image?query=Beautiful%20Paris%20cityscape%20with%20Eiffel%20Tower%20at%20sunset%2C%20romantic%20atmosphere%2C%20tourist%20destination%2C%20iconic%20landmark%2C%20vibrant%20colors%2C%20clear%20sky%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20professional%20lighting%2C%20scenic%20view&width=400&height=200&seq=1&orientation=landscape'
    },
    {
      id: 2,
      name: 'Tokyo Adventure',
      dateRange: 'June 5 - June 15, 2025',
      budget: 5000,
      spent: 2100,
      members: 2,
      image: 'https://readdy.ai/api/search-image?query=Tokyo%20cityscape%20with%20Mount%20Fuji%20in%20background%2C%20modern%20skyscrapers%2C%20cherry%20blossoms%2C%20vibrant%20street%20life%2C%20neon%20lights%2C%20clear%20blue%20sky%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20professional%20lighting%2C%20scenic%20urban%20view&width=400&height=200&seq=2&orientation=landscape'
    },
    {
      id: 3,
      name: 'Bali Retreat',
      dateRange: 'July 10 - July 20, 2025',
      budget: 4000,
      spent: 800,
      members: 6,
      image: 'https://readdy.ai/api/search-image?query=Tropical%20Bali%20beach%20paradise%20with%20palm%20trees%2C%20crystal%20clear%20turquoise%20water%2C%20white%20sand%2C%20traditional%20boats%2C%20lush%20greenery%2C%20sunset%20colors%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20professional%20lighting%2C%20scenic%20tropical%20view&width=400&height=200&seq=3&orientation=landscape'
    }
  ];

  // Upcoming trips data
  const upcomingTrips = [
    {
      id: 4,
      name: 'New York City',
      dateRange: 'August 15 - August 22, 2025',
      budget: 6000,
      image: 'https://readdy.ai/api/search-image?query=New%20York%20City%20skyline%20with%20Empire%20State%20Building%2C%20Central%20Park%2C%20yellow%20taxis%2C%20busy%20streets%2C%20blue%20sky%20with%20few%20clouds%2C%20daytime%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20professional%20lighting%2C%20scenic%20urban%20view&width=80&height=80&seq=4&orientation=squarish'
    },
    {
      id: 5,
      name: 'Barcelona',
      dateRange: 'September 3 - September 10, 2025',
      budget: 3500,
      image: 'https://readdy.ai/api/search-image?query=Barcelona%20cityscape%20with%20Sagrada%20Familia%2C%20Mediterranean%20coast%2C%20Spanish%20architecture%2C%20palm%20trees%2C%20blue%20sky%2C%20sunny%20day%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20professional%20lighting%2C%20scenic%20urban%20view&width=80&height=80&seq=5&orientation=squarish'
    }
  ];

  // Recent expenses data
  const recentExpenses = [
    {
      id: 1,
      category: 'Food',
      title: 'Dinner at Le Jules Verne',
      amount: 245.80,
      date: 'May 14, 2025',
      trip: 'Paris Getaway',
      members: 4,
      icon: 'fa-utensils'
    },
    {
      id: 2,
      category: 'Transportation',
      title: 'Metro Tickets',
      amount: 38.50,
      date: 'May 14, 2025',
      trip: 'Paris Getaway',
      members: 4,
      icon: 'fa-train'
    },
    {
      id: 3,
      category: 'Accommodation',
      title: 'Hotel Le Meurice',
      amount: 520.00,
      date: 'May 13, 2025',
      trip: 'Paris Getaway',
      members: 4,
      icon: 'fa-hotel'
    },
    {
      id: 4,
      category: 'Activities',
      title: 'Louvre Museum Tickets',
      amount: 75.00,
      date: 'May 13, 2025',
      trip: 'Paris Getaway',
      members: 4,
      icon: 'fa-ticket'
    }
  ];

  // Expense categories
  const expenseCategories = [
    { name: 'Food', icon: 'fa-utensils', color: 'bg-orange-500' },
    { name: 'Transport', icon: 'fa-car', color: 'bg-blue-500' },
    { name: 'Accommodation', icon: 'fa-hotel', color: 'bg-purple-500' },
    { name: 'Activities', icon: 'fa-hiking', color: 'bg-green-500' },
    { name: 'Shopping', icon: 'fa-shopping-bag', color: 'bg-pink-500' },
    { name: 'Other', icon: 'fa-ellipsis-h', color: 'bg-gray-500' }
  ];

  // Initialize chart
  React.useEffect(() => {
    if (activeTab === 'reports') {
      const chartDom = document.getElementById('expense-chart');
      if (chartDom) {
        const myChart = echarts.init(chartDom);
        const option = {
          tooltip: {
            trigger: 'item'
          },
          legend: {
            top: '5%',
            left: 'center',
            textStyle: {
              color: '#333'
            }
          },
          series: [
            {
              name: 'Expenses',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '12',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 245.80, name: 'Food' },
                { value: 38.50, name: 'Transport' },
                { value: 520.00, name: 'Accommodation' },
                { value: 75.00, name: 'Activities' },
                { value: 120.00, name: 'Shopping' },
                { value: 50.00, name: 'Other' }
              ]
            }
          ]
        };
        myChart.setOption(option);
        
        // Resize chart when window size changes
        window.addEventListener('resize', () => {
          myChart.resize();
        });
        
        return () => {
          window.removeEventListener('resize', () => {
            myChart.resize();
          });
          myChart.dispose();
        };
      }
    }
  }, [activeTab]);

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="pb-20">
            {/* Search Bar */}
            <div className="mb-6 px-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search trips..."
                  className="w-full py-3 px-4 pr-10 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="fas fa-search absolute right-4 top-3.5 text-gray-400"></i>
              </div>
            </div>

            {/* Active Trips */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold px-4 mb-3">Active Trips</h2>
              <div className="overflow-x-auto px-4 pb-2">
                <div className="flex space-x-4">
                  {activeTrips.map((trip) => (
                    <div key={trip.id} className="min-w-[280px] bg-white rounded-xl shadow-md overflow-hidden cursor-pointer">
                      <div className="h-32 w-full overflow-hidden">
                        <img src={trip.image} alt={trip.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-base">{trip.name}</h3>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{trip.members} members</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{trip.dateRange}</p>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Budget</span>
                            <span className="font-medium">${trip.spent} / ${trip.budget}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                              style={{ width: `${(trip.spent / trip.budget) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Trips */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold px-4 mb-3">Upcoming Trips</h2>
              <div className="px-4">
                {upcomingTrips.map((trip) => (
                  <div key={trip.id} className="bg-white rounded-xl shadow-sm p-4 mb-3 flex items-center cursor-pointer">
                    <div className="w-14 h-14 rounded-xl overflow-hidden mr-3">
                      <img src={trip.image} alt={trip.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-base">{trip.name}</h3>
                      <p className="text-xs text-gray-500">{trip.dateRange}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${trip.budget}</p>
                      <p className="text-xs text-gray-500">Budget</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trip History */}
            <div>
              <div className="flex justify-between items-center px-4 mb-3">
                <h2 className="text-lg font-semibold">Trip History</h2>
                <button className="text-blue-600 text-sm">View All</button>
              </div>
              <div className="px-4">
                <div className="bg-white rounded-xl shadow-sm p-4 mb-3 flex items-center cursor-pointer">
                  <div className="w-14 h-14 rounded-xl overflow-hidden mr-3 bg-gray-100 flex items-center justify-center">
                    <i className="fas fa-mountain text-gray-400 text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-base">Swiss Alps</h3>
                    <p className="text-xs text-gray-500">Feb 10 - Feb 17, 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">$4,250</p>
                    <p className="text-xs text-green-600">Under budget</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Trip Planner Button */}
            <button className="fixed right-5 bottom-20 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer">
              <i className="fas fa-robot text-white text-xl"></i>
            </button>
          </div>
        );
      case 'expenses':
        return (
          <div className="pb-20">
            {/* Trip Selector */}
            <div className="px-4 mb-6">
              <div className="relative">
                <select className="w-full appearance-none py-3 px-4 pr-10 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm">
                  <option>Paris Getaway (May 20 - May 27, 2025)</option>
                  <option>Tokyo Adventure (June 5 - June 15, 2025)</option>
                  <option>Bali Retreat (July 10 - July 20, 2025)</option>
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-3.5 text-gray-400"></i>
              </div>
            </div>

            {/* Budget Overview */}
            <div className="px-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Budget Overview</h3>
                  <span className="text-sm text-gray-500">$1,250 / $3,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>42% spent</span>
                  <span>$1,750 remaining</span>
                </div>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold px-4 mb-3">Categories</h2>
              <div className="grid grid-cols-3 gap-3 px-4">
                {expenseCategories.map((category, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-3 flex flex-col items-center cursor-pointer">
                    <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center mb-2`}>
                      <i className={`fas ${category.icon} text-white`}></i>
                    </div>
                    <span className="text-xs font-medium text-center whitespace-nowrap overflow-hidden text-overflow-ellipsis">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Expenses */}
            <div>
              <div className="flex justify-between items-center px-4 mb-3">
                <h2 className="text-lg font-semibold">Recent Expenses</h2>
                <button className="text-blue-600 text-sm">View All</button>
              </div>
              <div className="px-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="bg-white rounded-xl shadow-sm p-4 mb-3 cursor-pointer">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <i className={`fas ${expense.icon} text-blue-600`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-base">{expense.title}</h3>
                        <p className="text-xs text-gray-500">{expense.category} • {expense.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${expense.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Split ({expense.members})</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Expense Button */}
            <button className="fixed right-5 bottom-20 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer">
              <i className="fas fa-plus text-white text-xl"></i>
            </button>
          </div>
        );
      case 'add':
        return (
          <div className="pb-20 px-4">
            <div className="bg-white rounded-xl shadow-sm p-5 mt-4">
              <h2 className="text-xl font-semibold mb-6 text-center">Create New Trip</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Summer in Italy"
                  className="w-full py-3 px-4 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full py-3 px-4 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    className="w-full py-3 px-4 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <input 
                    type="text" 
                    placeholder="0.00"
                    className="w-full py-3 pl-8 pr-4 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Members</label>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs">You</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
                    <i className="fas fa-plus text-gray-500 text-xs"></i>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Categories</label>
                <div className="space-y-2">
                  {expenseCategories.slice(0, 4).map((category, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${category.color} rounded-full flex items-center justify-center mr-3`}>
                          <i className={`fas ${category.icon} text-white text-xs`}></i>
                        </div>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="relative w-24">
                        <span className="absolute left-2 top-2 text-gray-500 text-xs">$</span>
                        <input 
                          type="text" 
                          placeholder="0.00"
                          className="w-full py-2 pl-6 pr-2 bg-white rounded-lg text-xs focus:outline-none border-none shadow-sm"
                        />
                      </div>
                    </div>
                  ))}
                  <button className="text-blue-600 text-sm flex items-center">
                    <i className="fas fa-plus mr-1"></i> Add Category
                  </button>
                </div>
              </div>
              
              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-md !rounded-button">
                Create Trip
              </button>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="pb-20 px-4">
            {/* Trip Selector */}
            <div className="mb-6">
              <div className="relative">
                <select className="w-full appearance-none py-3 px-4 pr-10 bg-gray-50 rounded-xl text-sm focus:outline-none border-none shadow-sm">
                  <option>Paris Getaway (May 20 - May 27, 2025)</option>
                  <option>Tokyo Adventure (June 5 - June 15, 2025)</option>
                  <option>Bali Retreat (July 10 - July 20, 2025)</option>
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-3.5 text-gray-400"></i>
              </div>
            </div>

            {/* Expense Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <h3 className="font-semibold mb-3">Expense Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                  <p className="text-lg font-semibold">$1,250.00</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Remaining</p>
                  <p className="text-lg font-semibold">$1,750.00</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Daily Average</p>
                  <p className="text-lg font-semibold">$178.57</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Per Person</p>
                  <p className="text-lg font-semibold">$312.50</p>
                </div>
              </div>
            </div>

            {/* Expense Chart */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <h3 className="font-semibold mb-3">Expense Breakdown</h3>
              <div id="expense-chart" className="w-full h-64"></div>
            </div>

            {/* Daily Spending */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <h3 className="font-semibold mb-3">Daily Spending</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">May 13</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">$595.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">May 14</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">$284.30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">May 15</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">$370.70</span>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="flex space-x-3">
              <button className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium !rounded-button">
                <i className="fas fa-file-export mr-2"></i> Export PDF
              </button>
              <button className="flex-1 py-3 bg-green-100 text-green-700 rounded-xl font-medium !rounded-button">
                <i className="fas fa-file-excel mr-2"></i> Export CSV
              </button>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="pb-20 px-4">
            {/* Profile Header */}
            <div className="flex flex-col items-center mt-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-3">
                <span className="text-white text-3xl font-semibold">JD</span>
              </div>
              <h2 className="text-xl font-semibold">John Doe</h2>
              <p className="text-gray-500">john.doe@example.com</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-3 text-center">
                <p className="text-2xl font-semibold mb-1">8</p>
                <p className="text-xs text-gray-500">Total Trips</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-3 text-center">
                <p className="text-2xl font-semibold mb-1">3</p>
                <p className="text-xs text-gray-500">Active Trips</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-3 text-center">
                <p className="text-2xl font-semibold mb-1">$12.5k</p>
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold">Settings</h3>
              </div>
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <i className="fas fa-user text-blue-600 text-sm"></i>
                    </div>
                    <span>Account Details</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
                <div className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <i className="fas fa-bell text-purple-600 text-sm"></i>
                    </div>
                    <span>Notifications</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
                <div className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <i className="fas fa-dollar-sign text-green-600 text-sm"></i>
                    </div>
                    <span>Currency Settings</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
                <div className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <i className="fas fa-cloud text-orange-600 text-sm"></i>
                    </div>
                    <span>Backup & Sync</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-green-600 mr-2">On</span>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-medium !rounded-button">
              <i className="fas fa-sign-out-alt mr-2"></i> Logout
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Nav Bar */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-sm z-10">
        <div className="flex justify-between items-center px-4 py-4">
          <div>
            {activeTab === 'home' ? (
              <div>
                <h1 className="text-lg font-semibold">Hello, John</h1>
                <p className="text-xs text-gray-500">Wednesday, May 14, 2025</p>
              </div>
            ) : (
              <h1 className="text-lg font-semibold capitalize">{activeTab}</h1>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">
              <i className="fas fa-bell text-gray-500"></i>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">JD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20">
        {renderTabContent()}
      </div>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg rounded-t-xl z-10">
        <div className="grid grid-cols-5 py-2">
          <button 
            className={`flex flex-col items-center justify-center cursor-pointer ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('home')}
          >
            <i className={`fas fa-home ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'}`}></i>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center cursor-pointer ${activeTab === 'expenses' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('expenses')}
          >
            <i className={`fas fa-receipt ${activeTab === 'expenses' ? 'text-blue-600' : 'text-gray-500'}`}></i>
            <span className="text-xs mt-1">Expenses</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => setActiveTab('add')}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center -mt-5">
              <i className="fas fa-plus text-white"></i>
            </div>
            <span className="text-xs mt-1 text-gray-500">Add</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center cursor-pointer ${activeTab === 'reports' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className={`fas fa-chart-pie ${activeTab === 'reports' ? 'text-blue-600' : 'text-gray-500'}`}></i>
            <span className="text-xs mt-1">Reports</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center cursor-pointer ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className={`fas fa-user ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`}></i>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

