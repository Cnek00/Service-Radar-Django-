// frontend/src/components/Header.tsx (GÜNCELLENDİ)

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
// YENİ: Kullanıcı rollerini göstermek için ikonlar
import { Building2, ShieldCheck, User } from 'lucide-react'; 

const Header: React.FC = () => {
    // Hook'tan yetki bilgilerini çekiyoruz
    // YENİ: `auth` objesini de alıyoruz (fullName ve roller için)
    const { isAuthenticated: loggedIn, isSuperAdmin, logout, auth } = useAuth(); 

    return (
        <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-40">
            <div className="container mx-auto flex justify-between items-center">
                
                {/* Sol Taraf: Başlık */}
                <Link to="/" className="text-2xl font-bold hover:text-gray-300 transition duration-300">
                    Service Radar
                </Link>
                
                {/* Sağ Taraf: Navigasyon ve Auth Düğmeleri */}
                <nav className="flex items-center space-x-6">
                    {/* Anasayfa Linki */}
                    <Link 
                        to="/" 
                        className="hover:text-gray-300 transition duration-300"
                    >
                        Anasayfa
                    </Link>

                    {/* Admin Paneli Linki (Sadece Süper Adminler görür) */}
                    {isSuperAdmin && (
                        <Link 
                            to="/admin-panel" 
                            className="text-orange-400 font-bold hover:text-orange-300 transition duration-300 border border-orange-400 px-2 py-1 rounded-full text-sm"
                        >
                            ADMİN
                        </Link>
                    )}
                    
                    {/* Firma Paneli Linki (Giriş yapmışsa vurgulanır) */}
                    {loggedIn && (
                        <Link 
                            to="/firm-panel" 
                            className="text-yellow-400 font-semibold hover:text-yellow-300 transition duration-300"
                        >
                            Firma Paneli
                        </Link>
                    )}

                    {/* Oturum Durumu Kontrolü */}
                    {loggedIn ? (
                        // === GİRİŞ YAPILMIŞSA ===
                        <>
                            {/* YENİ: Kullanıcı Bilgisi Alanı */}
                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                {auth.isSuperuser ? (
                                    <ShieldCheck className="w-5 h-5 text-orange-400" />
                                ) : auth.isFirmManager ? (
                                    <Building2 className="w-5 h-5 text-yellow-400" />
                                ) : (
                                    <User className="w-5 h-5 text-blue-400" />
                                )}
                                <span className="font-medium">{auth.fullName || 'Kullanıcı'}</span>
                            </div>

                            {/* Çıkış Yap Düğmesi */}
                            <button
                                onClick={logout} // authService'deki fonksiyonu çağırır
                                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-full text-sm transition duration-300"
                            >
                                Çıkış Yap
                            </button>
                        </>
                    ) : (
                        // === GİRİŞ YAPILMAMIŞSA ===
                        <>
                            <Link 
                                to="/register" 
                                className="hover:text-gray-300 transition duration-300 text-sm"
                            >
                                Müşteri Kayıt
                            </Link>
                            <Link 
                                to="/firm-register" 
                                className="hover:text-gray-300 transition duration-300 text-sm"
                            >
                                Firma Kayıt
                            </Link>
                            <Link 
                                to="/login" 
                                className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-full text-sm transition duration-300"
                            >
                                Giriş Yap
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;