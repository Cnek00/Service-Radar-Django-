// frontend/src/authService.ts 

export interface ILoginOut {
    access: string;
    refresh: string;
    is_superuser: boolean;
    is_firm_manager: boolean;
    id: number;
    full_name: string | null;
}

export interface UserCredentials {
    [x: string]: string | number | readonly string[] | undefined;
    email: string;
    password: string;
}

// Backend'e direkt istek atmak için base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api/auth'; 

// LocalStorage Anahtarları
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ADMIN_STATUS_KEY = 'user_is_superuser'; 
const FIRM_MANAGER_STATUS_KEY = 'user_is_firm_manager';
const USER_ID_KEY = 'user_id'; // Yeni: Kullanıcı ID'sini tutmak için
const FULL_NAME_KEY = 'full_name'; // Yeni: Ad Soyad bilgisini tutmak için

// Kullanıcının oturum bilgilerini ve yetkilerini tutacak tip
export interface AuthState {
    id: number | null;
    fullName: string | null;
    isSuperuser: boolean;
    isFirmManager: boolean;
}

// --- Yardımcı Fonksiyonlar ---

/**
 * Oturum tokenlarını ve yetki bilgilerini localStorage'dan siler.
 */
export function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_STATUS_KEY);
    localStorage.removeItem(FIRM_MANAGER_STATUS_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(FULL_NAME_KEY);
    
    // Oturum kapatıldığında kullanıcıyı login sayfasına yönlendir (yeniden yükleme ile)
    window.location.href = '/login';
}

/**
 * Kullanıcının giriş yapıp yapmadığını kontrol eder.
 */
export function isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Kullanıcının Süper Admin olup olmadığını kontrol eder.
 */
export function isSuperuser(): boolean {
    const status = localStorage.getItem(ADMIN_STATUS_KEY);
    return status === 'true';
}

/**
 * Kullanıcının Firma Yöneticisi olup olmadığını kontrol eder.
 */
export function isFirmManager(): boolean {
    // Sadece Süper Admin değilse kontrol et (Süper Adminler her zaman yetkilidir)
    if (isSuperuser()) return true;
    
    const status = localStorage.getItem(FIRM_MANAGER_STATUS_KEY);
    return status === 'true';
}

/**
 * Kullanıcının temel kimlik bilgilerini döndürür.
 */
export function getAuthState(): AuthState {
    const userId = localStorage.getItem(USER_ID_KEY);
    const fullName = localStorage.getItem(FULL_NAME_KEY);
    
    return {
        id: userId ? parseInt(userId) : null,
        fullName: fullName,
        isSuperuser: isSuperuser(),
        isFirmManager: isFirmManager(),
    };
}


// --- Ana Login Fonksiyonu ---

interface LoginResult {
    success: boolean;
    error?: string;
}

/**
 * Login API çağrısını yapar, tokenları ve yetki durumunu kaydeder.
 */
export async function login(credentials: UserCredentials): Promise<LoginResult> {
    const API_LOGIN_URL = `${API_BASE_URL}/login`; 

    try {
        const response = await fetch(API_LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (response.ok) {
            // Backend'den gelen veriler: access, refresh, is_superuser, is_firm_manager, id, full_name
            const data: ILoginOut = await response.json(); 
            
            // 1. Token'ları kaydet
            localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
            localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
            
            // 2. Yetki ve Kimlik bilgilerini kaydet
            localStorage.setItem(ADMIN_STATUS_KEY, data.is_superuser ? 'true' : 'false');
            localStorage.setItem(FIRM_MANAGER_STATUS_KEY, data.is_firm_manager ? 'true' : 'false');
            localStorage.setItem(USER_ID_KEY, String(data.id));
            // Ensure the value stored is a string to satisfy localStorage.setItem's parameter types
            localStorage.setItem(FULL_NAME_KEY, String(data.full_name ?? ''));

            return { success: true };

        } else {
            const errorData = await response.json().catch(() => ({ detail: 'Giriş başarısız' }));
            return { success: false, error: errorData.detail || 'Giriş başarısız oldu' };
        }
    } catch (error) {
        console.error("Login API hatası:", error);
        return { success: false, error: 'Sunucuya bağlanılamadı veya beklenmeyen bir hata oluştu.' };
    }
}