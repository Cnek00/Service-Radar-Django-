import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Heart, Settings, Building2, Shield, Search } from 'lucide-react';
import { useState } from 'react';

interface EnhancedHeaderProps {
  isAuthenticated: boolean;
  userFullName: string | null;
  isSuperAdmin: boolean;
  isCompanyManager: boolean;
  onLogout: () => void;
  onShowFavorites?: () => void;
  onShowSettings?: () => void;
}

export default function EnhancedHeader({
  isAuthenticated,
  userFullName,
  isSuperAdmin,
  isCompanyManager,
  onLogout,
  onShowFavorites,
  onShowSettings,
}: EnhancedHeaderProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 shadow-lg sticky top-0 z-40 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
          >
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
              <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Service Radar</h1>
              <p className="text-xs text-blue-100">Hizmet Bulma Platformu</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {!isSuperAdmin && !isCompanyManager && onShowFavorites && (
                  <button
                    onClick={onShowFavorites}
                    className="p-2 hover:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors text-white relative group"
                    title="Favorilerim"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Favorilerim
                    </span>
                  </button>
                )}

                {(isCompanyManager || isSuperAdmin) && (
                  <Link
                    to={isSuperAdmin ? '/admin' : '/firma-panel'}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium"
                  >
                    {isSuperAdmin ? (
                      <>
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">Admin Panel</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Firma Paneli</span>
                      </>
                    )}
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline font-medium">
                      {userFullName || 'Kullanıcı'}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 border border-gray-200 dark:border-gray-700">
                      {onShowSettings && (
                        <button
                          onClick={() => {
                            onShowSettings();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Ayarlar</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold shadow-md"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
