import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from 'react-hot-toast';
import App from './App';

const AppRoot: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#333333',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
              },
              success: {
                iconTheme: {
                  primary: '#4caf50',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f44336',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          <App />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default AppRoot;