import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../authService';
import { LogOut, Home, Building2 } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              <Building2 className="w-8 h-8" />
              <span>Service Radar</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              <span>Anasayfa</span>
            </Link>

            <Link
              to="/firm-panel"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              <Building2 className="w-5 h-5" />
              <span>Firma Paneli</span>
            </Link>

            {isAuthenticated() ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Giriş Yap
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
