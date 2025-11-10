// frontend/src/hooks/useAuth.ts

import { useState, useEffect } from 'react';
import { isAuthenticated, logout as authLogout } from '../authService';

interface AuthStatus {
    isAuthenticated: boolean;
    logout: () => void;
}

/**
 * Oturum durumunu gerçek zamanlı olarak dinleyen ve sağlayan React Hook'u.
 * Bu hook, bileşenlerin otomatik olarak güncellenmesini sağlar.
 */
export const useAuth = (): AuthStatus => {
    // İlk yüklemede ve localStorage değiştiğinde durumu güncelleyen state
    const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

    // Oturum durumunu manuel olarak kontrol eden fonksiyon
    const checkAuthStatus = () => {
        setIsLoggedIn(isAuthenticated());
    };

    useEffect(() => {
        // localStorage'daki değişiklikleri dinlemek için event listener
        // login veya logout olduğunda bu event tetiklenir
        window.addEventListener('storage', checkAuthStatus);
        
        // Component kaldırıldığında listener'ı temizle
        return () => {
            window.removeEventListener('storage', checkAuthStatus);
        };
    }, []);

    // authService'deki logout fonksiyonunu çağırıp, state'i günceller
    const handleLogout = () => {
        authLogout();
        // Logout işlemi, App.tsx'teki ProtectedRoute'un Navigate etmesini sağlar
        setIsLoggedIn(false); 
    };

    return {
        isAuthenticated: isLoggedIn,
        logout: handleLogout,
    };
};