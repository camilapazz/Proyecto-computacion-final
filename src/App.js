import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Peliculas from './components/Peliculas';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar si hay una sesión activa
    const savedUser = localStorage.getItem('dulcami_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setCurrentView('peliculas');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('dulcami_user', JSON.stringify(userData));
    setCurrentView('peliculas');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('dulcami_user');
    setCurrentView('login');
  };

  const renderCurrentView = () => {
    if (isAuthenticated && currentView === 'peliculas') {
      return <Peliculas user={user} onLogout={handleLogout} />;
    }

    switch (currentView) {
      case 'login':
        return (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setCurrentView('register')}
          />
        );
      case 'register':
        return (
          <Register
            onRegisterSuccess={() => setCurrentView('login')}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      default:
        return (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setCurrentView('register')}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

export default App;