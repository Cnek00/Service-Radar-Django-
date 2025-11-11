import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { initTheme } from './utils/theme';
import EnhancedHeader from './components/EnhancedHeader';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import FavoritesPanel from './components/FavoritesPanel';
import SettingsPanel from './components/SettingsPanel';
import './App.css';

interface AuthState {
  isAuthenticated: boolean;
  userFullName: string | null;
  isSuperAdmin: boolean;
  isCompanyManager: boolean;
}

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: !!localStorage.getItem('accessToken'),
    userFullName: localStorage.getItem('full_name'),
    isSuperAdmin: localStorage.getItem('user_is_superuser') === 'true',
    isCompanyManager: localStorage.getItem('user_is_firm_manager') === 'true',
  });

  const [showFavorites, setShowFavorites] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    initTheme();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user_is_superuser');
    localStorage.removeItem('user_is_firm_manager');
    localStorage.removeItem('user_id');
    localStorage.removeItem('full_name');

    setAuthState({
      isAuthenticated: false,
      userFullName: null,
      isSuperAdmin: false,
      isCompanyManager: false,
    });

    window.location.href = '/';
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <EnhancedHeader
            isAuthenticated={authState.isAuthenticated}
            userFullName={authState.userFullName}
            isSuperAdmin={authState.isSuperAdmin}
            isCompanyManager={authState.isCompanyManager}
            onLogout={handleLogout}
            onShowFavorites={() => setShowFavorites(true)}
            onShowSettings={() => setShowSettings(true)}
          />

          <main className="min-h-[calc(100vh-4rem)]">
            <Routes>
              <Route
                path="/"
                element={<HomePage onSuccess={showNotification} />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <FavoritesPanel
            isOpen={showFavorites}
            onClose={() => setShowFavorites(false)}
          />

          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />

          {notification && (
            <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-up">
              <p className="font-medium">{notification}</p>
            </div>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
