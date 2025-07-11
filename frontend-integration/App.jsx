import React, { useState, useEffect } from 'react';
import apiClient from './apiClient';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Dashboard from './Dashboard';

/**
 * Main App Component
 * Copy this to your Lovable project and customize as needed
 */
const App = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'dashboard'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token might be expired, clear it
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    // After registration, typically redirect to login
    setCurrentView('login');
    alert('Registration successful! Please login with your credentials.');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading Networking App...</h2>
          <p>Connecting to your backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      {currentView === 'login' && (
        <LoginForm 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={switchToRegister}
        />
      )}
      
      {currentView === 'register' && (
        <RegisterForm 
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}
      
      {currentView === 'dashboard' && user && (
        <Dashboard 
          user={user}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;