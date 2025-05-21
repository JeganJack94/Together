import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Expenses from './pages/Expenses';
import AddTrip from './pages/AddTrip';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import LandingPage from './pages/auth/LandingPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import { useRegisterSW, PWAPrompt } from './components/PWAComponents';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Component to handle redirects based on auth state
function AuthRedirect() {
  const { user } = useAuth();
  const location = useLocation();
  if (user && ['/signin', '/signup', '/'].includes(location.pathname)) {
    return <Navigate to="/app" replace />;
  }
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null;
  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />;
  return <>{children}</>;
}

function AppRoutes({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  const navigate = useNavigate();
  const navigateTo = (page: 'landing' | 'signin' | 'signup') => {
    if (page === 'landing') navigate('/');
    if (page === 'signin') navigate('/signin');
    if (page === 'signup') navigate('/signup');
  };
  return (
    <div className="flex flex-col min-h-screen">
      <AuthRedirect />
      <Routes>
        <Route path="/" element={<LandingPage navigateTo={navigateTo} />} />
        <Route path="/signin" element={<SignInPage navigateTo={navigateTo} />} />
        <Route path="/signup" element={<SignUpPage navigateTo={navigateTo} />} />
        <Route path="/app/*" element={
          <ProtectedRoute>
            <MainApp darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Main application component for tabbed navigation
function MainApp({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  const [activeTab, setActiveTab] = useState('home');
  useRegisterSW(); // Register service worker

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'expenses':
        return <Expenses />;
      case 'add':
        return <AddTrip onClose={() => setActiveTab('home')} />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 w-full max-w-md mx-auto transition-colors duration-200">
      <Navbar activeTab={activeTab} />
      <div className="pt-20 px-0">
        {renderTabContent()}
        <PWAPrompt />
      </div>
      {/* Tab Bar */}
      <div className="fixed bottom-0 left-0 w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-t-xl z-10 transition-colors duration-200">
        <div className="grid grid-cols-5 py-2">
          <button 
            className={`flex flex-col items-center justify-center cursor-pointer focus:outline-none ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('home')}
          >
            <i className={`fas fa-home ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}></i>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center cursor-pointer focus:outline-none ${activeTab === 'expenses' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('expenses')}
          >
            <i className={`fas fa-receipt ${activeTab === 'expenses' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}></i>
            <span className="text-xs mt-1">Expenses</span>
          </button>
          <button 
            className="flex flex-col items-center justify-center cursor-pointer focus:outline-none"
            onClick={() => setActiveTab('add')}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center -mt-5">
              <i className="fas fa-plus text-white"></i>
            </div>
            <span className="text-xs mt-1 text-gray-500 dark:text-gray-400"></span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center cursor-pointer focus:outline-none ${activeTab === 'reports' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className={`fas fa-chart-pie ${activeTab === 'reports' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}></i>
            <span className="text-xs mt-1">Reports</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center cursor-pointer focus:outline-none ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className={`fas fa-user ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}></i>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Dark mode state and logic moved here
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
