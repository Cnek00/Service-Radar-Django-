// src/authService.ts



export interface UserCredentials {
    username: string;
    password: string;
}

export interface TokenResponse {
    access: string;
    refresh: string;
}
// Local olarak LoginResult tipini burada tanımlıyoruz çünkü ./types/api içinde export edilmemiş.
// İsterseniz bu tipi types/api dosyasına ekleyip buradaki tanımı kaldırabilirsiniz.
export interface LoginResult {
    success: boolean;
    user?: string;
    error?: string;
}

// Ana JWT rotası
const JWT_URL = 'http://127.0.0.1:8000/auth/token/'; 

/**
 * Kullanıcı adı ve şifre ile token alır ve localStorage'a kaydeder.
 */
export async function login(credentials: UserCredentials): Promise<LoginResult> {
    try {
        const response = await fetch(JWT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Giriş Başarısız.');
        }

        const data: TokenResponse = await response.json();
        
        // Token'ları kalıcı olarak kaydet
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh); 
        
        return { success: true, user: credentials.username }; 
        
    } catch (error: any) {
        console.error("Giriş hatası:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Kullanıcının oturumunu kapatır ve token'ları siler.
 */
export function logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.reload(); 
}

/**
 * Kullanıcının giriş yapıp yapmadığını kontrol eder.
 */
export function isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
}