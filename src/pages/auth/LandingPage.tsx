import React from 'react';

interface NavigationProps {
  navigateTo: (page: 'landing' | 'signin' | 'signup') => void;
}

const LandingPage: React.FC<NavigationProps> = ({ navigateTo }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed w-full top-0 bg-white shadow-sm z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Tg</span>
            </div>
            <span className="ml-2 font-semibold text-lg">ToGether</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigateTo('signin')}
              className="text-sm text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigateTo('signup')}
              className="text-sm text-white font-medium px-3 py-1.5 bg-purple-700 rounded-lg hover:bg-purple-800 transition shadow-sm cursor-pointer !rounded-button"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with padding for fixed header */}
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="px-4 py-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
              Plan Trips. Track Expenses. Settle Up Easily.
            </h1>
            <p className="text-gray-600 mb-6 max-w-xs">
              ToGether helps you organize group trips, split expenses, and keep everyone on the same page—effortlessly.
            </p>
            <button 
              onClick={() => navigateTo('signup')}
              className="bg-purple-700 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:bg-purple-800 transition transform hover:scale-105 mb-8 cursor-pointer !rounded-button"
            >
              Get Started — It's Free
            </button>
            <div className="w-full max-w-xs h-64 rounded-xl overflow-hidden shadow-lg mb-6">
              <img 
                src="https://cdn.prod.website-files.com/65ca6f59445c0a52f3323325/673dbc548622569cb5c3ef18_teacode%20ai%20planning%20app%20phone%20with%203d%20car%20and%20globe.webp" 
                alt="ToGether App Preview" 
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-8 bg-white">
          <h2 className="text-2xl font-semibold text-center mb-8">Why Choose ToGether</h2>
          <div className="grid grid-cols-1 gap-6">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <i className="fas fa-users text-purple-700 text-xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Group Trip Planning</h3>
              <p className="text-gray-600 text-sm">
                Create trips, invite friends, and manage all your travel details in one place.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <i className="fas fa-receipt text-purple-700 text-xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Effortless Expense Tracking</h3>
              <p className="text-gray-600 text-sm">
                Log and split expenses instantly. See who owes what, and keep everything transparent.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <i className="fas fa-balance-scale text-purple-700 text-xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Settle Up Instantly</h3>
              <p className="text-gray-600 text-sm">
                Track balances and settle up with friends easily after every trip.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="px-4 py-10 bg-gray-50">
          <h2 className="text-2xl font-semibold text-center mb-8">What Our Users Say</h2>
          {/* Testimonial Card */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                <span className="text-purple-700 font-medium">JD</span>
              </div>
              <div>
                <h4 className="font-medium">James Davidson</h4>
                <p className="text-sm text-gray-500">Travel Enthusiast</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm italic">
              "ToGether made our group trip so much easier! No more confusion about who paid for what. Highly recommended for friends and families."
            </p>
            <div className="mt-3 flex">
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
            </div>
          </div>
          {/* Testimonial Card */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                <span className="text-purple-700 font-medium">SR</span>
              </div>
              <div>
                <h4 className="font-medium">Sarah Reynolds</h4>
                <p className="text-sm text-gray-500">Trip Organizer</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm italic">
              "The best app for managing group travel expenses. Everyone stays in sync and settling up is a breeze!"
            </p>
            <div className="mt-3 flex">
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star text-yellow-400"></i>
              <i className="fas fa-star-half-alt text-yellow-400"></i>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="px-4 py-8 bg-white">
          <p className="text-center text-sm text-gray-500 mb-6">Trusted by travel lovers and groups</p>
          <div className="flex justify-around items-center">
            <div className="text-gray-400 font-semibold">TripMate</div>
            <div className="text-gray-400 font-semibold">GroupGo</div>
            <div className="text-gray-400 font-semibold">TravelEase</div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4 mt-auto">
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 WinTech-ToGether. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-3">
            <a href="#" className="hover:text-purple-700 transition cursor-pointer">Terms</a>
            <a href="#" className="hover:text-purple-700 transition cursor-pointer">Privacy</a>
            <a href="#" className="hover:text-purple-700 transition cursor-pointer">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
