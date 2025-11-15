import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthData {
    isAuthenticated: boolean;
    userId: number | null;
    fullName: string | null;
    isSuperUser: boolean;
    isCompanyManager: boolean;
}

export function useAuth(): AuthData & { logout: () => void } {
    const navigate = useNavigate();
    const [auth, setAuth] = useState<AuthData>({
        isAuthenticated: !!localStorage.getItem('accessToken'),
        userId: localStorage.getItem('user_id') ? Number(localStorage.getItem('user_id')) : null,
        fullName: localStorage.getItem('full_name'),
        isSuperUser: localStorage.getItem('user_is_superuser') === 'true',
        isCompanyManager: localStorage.getItem('user_is_firm_manager') === 'true',
    });

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_id');
        localStorage.removeItem('full_name');
        localStorage.removeItem('user_is_superuser');
        localStorage.removeItem('user_is_firm_manager');
        setAuth({
            isAuthenticated: false,
            userId: null,
            fullName: null,
            isSuperUser: false,
            isCompanyManager: false,
        });
        navigate('/');
    };

    return { ...auth, logout };
}
