// frontend/src/hooks/useAuth.ts (Kopyala-Yapıştır)

import { useState, useEffect } from 'react';
import { isAuthenticated, isSuperuser, isFirmManager, logout as authLogout, getAuthState } from '../authService';

/**
 * Global oturum ve yetkilendirme durumunu takip etmek için kullanılan hook.
 */
export const useAuth = () => {
    // Stateler
    const [isAuthenticatedState, setIsAuthenticatedState] = useState(isAuthenticated());
    const [isSuperAdmin, setIsSuperAdmin] = useState(isSuperuser());
    const [isCompanyManager, setIsCompanyManager] = useState(isFirmManager()); // Yeni state

    // Tarayıcı event'larını dinleyerek otomatik güncelleme
    useEffect(() => {
        // Oturum veya yetki değiştiğinde state'leri yeniden kontrol et
        const handleStorageChange = () => {
            setIsAuthenticatedState(isAuthenticated());
            setIsSuperAdmin(isSuperuser());
            setIsCompanyManager(isFirmManager());
        };

        // Bu event, localStorage değiştiğinde tüm sekmelerde çalışır
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Çıkış fonksiyonu (useAuth üzerinden erişilir)
    const handleLogout = () => {
        authLogout();
        setIsAuthenticatedState(false);
        setIsSuperAdmin(false);
        setIsCompanyManager(false);
    };

    return {
        isAuthenticated: isAuthenticatedState,
        isSuperAdmin,
        isCompanyManager, // Yeni eklenen
        logout: handleLogout,
        auth: getAuthState(),
    };
};