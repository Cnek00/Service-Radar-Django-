// frontend/src/apiClient.ts

import { 
    type IService, 
    type IReferralRequestIn, 
    type IReferralRequestOut, 
    // YENİ TİP İMPORTLARI: Firm Yönetimi için eklenenler
    type IUser, 
    type FirmEmployeeCreatePayload, 
    type FirmEmployeeUpdatePayload 
} from './types/api';
import { logout } from './authService'; 

// Backend'inizdeki Core router'ına yönlendirilen temel adres
const API_BASE_URL = 'http://127.0.0.1:8000/api/core';

/**
 * Genel API çağrısı yapıcı fonksiyon
 * @param endpoint - API'deki yol (örn: 'services/search')
 * @param method - HTTP metodu (GET, POST, PUT, DELETE) - GÜNCELLENDİ
 * @param data - POST, PUT veya DELETE ile gönderilecek veri
 * @param requiresAuth - JWT token'ı gerektirip gerektirmediği
 * @returns Sunucudan gelen veriyi döner
 */
async function callApi<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', // Method güncellendi
    data: any = null,
    requiresAuth: boolean = false 
): Promise<T> {
    
    // Firma Yönetimi API'leri için farklı path kullanmalıyız.
    // Eğer endpoint 'firm/management' ile başlıyorsa, API_BASE_URL'i kullanmayız.
    const url = endpoint.startsWith('firm/management') || endpoint.startsWith('admin')
        ? `http://127.0.0.1:8000/api/${endpoint}` // Firm/Admin router'ları doğrudan 'api' altında olduğu varsayılır
        : `${API_BASE_URL}/${endpoint}`; // Diğerleri core router'ı altında

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // JWT KONTROLÜ VE EKLEME
    if (requiresAuth) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error("Yetkilendirme token'ı bulunamadı. Lütfen giriş yapın.");
        }
        headers['Authorization'] = `Bearer ${token}`; 
    }

    const options: RequestInit = {
        method,
        headers,
        // DELETE veya GET ise body göndermeye gerek yok
        body: (data && method !== 'GET' && method !== 'DELETE') ? JSON.stringify(data) : undefined,
    };

    try {
        const response = await fetch(url, options);

        // YENİ: MERKEZİ HATA YÖNETİMİ
        if (response.status === 401 || response.status === 403) {
            // JWT süresi dolduysa veya yetki yoksa, kullanıcıyı çıkışa zorla
            logout(); 
             // Hata mesajını daha açıklayıcı fırlat
            throw new Error(response.status === 403 ? "Erişim yetkiniz bulunmamaktadır." : "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.");
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Sunucu hatası' }));
            throw new Error(errorData.detail || `API isteği başarısız oldu: ${response.status}`);
        }

        // 204 No Content (DELETE) veya boş yanıt durumunda null döndür
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null as T;
        }

        return response.json() as Promise<T>;

    } catch (error) {
        console.error(`[API ERROR] ${method} ${url}`, error);
        throw error;
    }
}

// =======================================================
// 1. MÜŞTERİ İÇİN API FONKSİYONLARI
// =======================================================

export const searchServices = (query: string = '', location: string = ''): Promise<IService[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (location) params.append('location', location);
    
    const endpoint = `services/search?${params.toString()}`;
    return callApi<IService[]>(endpoint, 'GET');
};

export const createReferral = (payload: IReferralRequestIn): Promise<IReferralRequestOut> => {
    return callApi<IReferralRequestOut>('referral/create', 'POST', payload);
};


// =======================================================
// 2. YETKİLENDİRİLMİŞ (FİRMA) API FONKSİYONLARI
// =======================================================

export const fetchFirmReferrals = (): Promise<IReferralRequestOut[]> => {
    return callApi<IReferralRequestOut[]>('firm/my-referrals', 'GET', null, true); 
};

export const handleReferralAction = (
    requestId: number, 
    action: 'accept' | 'reject'
): Promise<{ success: boolean; message: string }> => {
    
    const payload = { action };

    return callApi<{ success: boolean; message: string }>(
        `company/request/${requestId}/action`, 
        'POST', 
        payload, 
        true // JWT token gereklidir
    );
};


// =======================================================
// 3. YETKİLENDİRİLMİŞ (ADMİN) API FONKSİYONLARI
// =======================================================

/**
 * [SADECE ADMIN İÇİN] Sistemdeki tüm firma taleplerini çeker (GET /admin/all-referrals). JWT gereklidir.
 */
export const fetchAllReferrals = (): Promise<IReferralRequestOut[]> => {
    // BURADA ENDPOINT AYARLANDI: api/admin/all-referrals
    return callApi<IReferralRequestOut[]>('admin/all-referrals', 'GET', null, true); 
};


// =======================================================
// 4. FİRMA İÇİ KULLANICI YÖNETİMİ API FONKSİYONLARI (YENİ)
// =======================================================

/**
 * Firmaya ait tüm çalışanları listeler (GET /firm/management/users). JWT ve IsFirmEmployee gereklidir.
 */
export const fetchFirmEmployees = (): Promise<IUser[]> => {
    // Endpoint: api/firm/management/users
    return callApi<IUser[]>('firm/management/users', 'GET', null, true); 
};

/**
 * Yeni bir firma çalışanı oluşturur (POST /firm/management/users). JWT ve IsFirmManager gereklidir.
 */
export const createFirmEmployee = (payload: FirmEmployeeCreatePayload): Promise<IUser> => {
    // Endpoint: api/firm/management/users
    return callApi<IUser>('firm/management/users', 'POST', payload, true);
};

/**
 * Firma çalışanının yetkisini günceller (PUT /firm/management/users/{id}). JWT ve IsFirmManager gereklidir.
 */
export const updateFirmEmployeeRole = (userId: number, payload: FirmEmployeeUpdatePayload): Promise<IUser> => {
    // Endpoint: api/firm/management/users/{userId}
    return callApi<IUser>(`firm/management/users/${userId}`, 'PUT', payload, true);
};

/**
 * Firma çalışanını siler (DELETE /firm/management/users/{id}). JWT ve IsFirmManager gereklidir.
 */
export const deleteFirmEmployee = (userId: number): Promise<void> => {
    // Endpoint: api/firm/management/users/{userId}
    // Silme işlemi 204 No Content döndürür, bu yüzden Promise<void> kullanılır.
    return callApi<void>(`firm/management/users/${userId}`, 'DELETE', null, true);
};