// frontend/src/components/Header.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // YENİ HOOK'UMUZ

const Header: React.FC = () => {
    // Hook'u kullanarak durumu ve fonksiyonu alıyoruz
    const { isAuthenticated: loggedIn, logout } = useAuth();

    return (
        <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-40">
            <div className="container mx-auto flex justify-between items-center">
                
                <Link to="/" className="text-2xl font-bold hover:text-gray-300 transition duration-300">
                    Service Radar
                </Link>
                
                <nav className="flex items-center space-x-6">
                    <Link 
                        to="/" 
                        className="hover:text-gray-300 transition duration-300"
                    >
                        Anasayfa
                    </Link>
                    
                    <Link 
                        to="/firm-panel" 
                        className={`${loggedIn ? 'text-yellow-400 font-semibold' : 'hover:text-gray-300'} transition duration-300`}
                    >
                        Firma Paneli
                    </Link>

                    {loggedIn ? (
                        <button
                            onClick={logout} // Hook'tan gelen logout fonksiyonu
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-full text-sm transition duration-300"
                        >
                            Çıkış Yap
                        </button>
                    ) : (
                        <Link 
                            to="/login" 
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-full text-sm transition duration-300"
                        >
                            Giriş Yap
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;