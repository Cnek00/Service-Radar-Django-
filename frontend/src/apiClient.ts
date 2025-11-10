// frontend/src/apiClient.ts

import {
    type IService,
    type IReferralRequestIn,
    type IReferralRequestOut,
    type IUser,
    type FirmEmployeeCreatePayload,
    type FirmEmployeeUpdatePayload,
    type IRegisterIn,
    type IFirmRegisterIn
} from './types/api';
import { getAccessToken, logout } from './authService';

// Django REST Framework (DRF) URL yapınıza göre güncelleyin
// Örn: http://127.0.0.1:8000/api/v1
const API_BASE_URL = 'http://127.0.0.1:8000/api';
export { API_BASE_URL }; // authService'in kullanması için export ediyoruz

/**
 * Genel API çağrısı yapıcı fonksiyon
 * @param endpoint - API'deki yol (örn: 'core/services/search' veya 'firm/management/users')
 * @param method - HTTP metodu (GET, POST, PUT, DELETE)
 * @param data - POST, PUT veya DELETE ile gönderilecek veri
 * @param requiresAuth - JWT token'ı gerektirip gerektirmediği
 * @returns Sunucudan gelen veriyi döner (T tipinde)
 */
async function callApi<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data: any = null,
    requiresAuth: boolean = false
): Promise<T> {

    // Backend dökümantasyonunuza göre URL'i belirliyoruz (core, firm, users)
    let url = `${API_BASE_URL}/${endpoint}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Yetkilendirme (JWT)
    if (requiresAuth) {
        const token = getAccessToken();
        if (!token) {
            logout();
            throw new Error('Yetkilendirme Gerekli (Token Yok)');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
    }

    // GET isteği ve Query Parametreleri
    if (method === 'GET' && data) {
        const params = new URLSearchParams(data).toString();
        url = `${url}?${params}`;
    }


    try {
        const response = await fetch(url, config);

        // JWT token'ının süresi dolduysa ve 401 hatası aldıysak
        if (response.status === 401 && requiresAuth) {
            // Opsiyonel: Token yenileme mekanizması burada eklenebilir. 
            // Şimdilik sadece çıkış yapıyoruz.
            logout();
            throw new Error('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.');
        }

        if (!response.ok) {
            let errorDetail = 'Bilinmeyen bir hata oluştu.';
            try {
                // Hata detayını backend'den almaya çalış
                const errorData = await response.json();
                errorDetail = errorData.detail || errorData.message || errorData[Object.keys(errorData)[0]]?.[0] || `Sunucu Hatası: ${response.status}`;
            } catch {
                // JSON değilse varsayılan mesajı kullan
                errorDetail = `API çağrısı başarısız oldu: ${response.statusText}`;
            }
            throw new Error(errorDetail);
        }

        // DELETE veya 204 No Content durumları için boş obje dön
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return {} as T;
        }

        return await response.json() as T;

    } catch (error) {
        // Ağ hataları veya yukarıdaki throw edilen hatalar
        throw error;
    }
}


// =======================================================
// 1. GENEL / PUBLIC API FONKSİYONLARI
// =======================================================

/**
 * Hizmetleri arar (GET /core/services/search?query=...&location=...). Public erişim.
 */
export const searchServices = (query: string, location: string): Promise<IService[]> => {
    // Backend: /api/core/services/search
    return callApi<IService[]>('core/services/search', 'GET', { query, location }, false);
};

/**
 * Yeni bir yönlendirme talebi oluşturur (POST /core/referrals). Public erişim.
 */
export const createReferral = (payload: IReferralRequestIn): Promise<IReferralRequestOut> => {
    // Backend: /api/core/referral/create
    return callApi<IReferralRequestOut>('core/referral/create', 'POST', payload, false);
};

/**
 * Yeni bir müşteri hesabı oluşturur (POST /users/register). Public erişim.
 */
export const registerCustomer = (payload: IRegisterIn): Promise<{ success: boolean; error?: string }> => {
    // Endpoint: api/core/users/register (is_firm=false olarak gönderilmeli)
    // callApi throws on error; pages expect a result object with success property
    return callApi<void>('core/users/register', 'POST', { ...payload, is_firm: false }, false)
        .then(() => ({ success: true })) as unknown as Promise<any>;
};

/**
 * Yeni bir firma ve yönetici hesabı oluşturur (POST /firm/register). Public erişim.
 */
export const registerFirmAndUser = (payload: IFirmRegisterIn): Promise<{ success: boolean; error?: string }> => {
    // Endpoint: api/core/firm/register
    return callApi<void>('core/firm/register', 'POST', payload, false)
        .then(() => ({ success: true })) as unknown as Promise<any>;
};


// =======================================================
// 2. FİRMA YÖNETİMİ API FONKSİYONLARI (JWT GEREKLİ)
// =======================================================

/**
 * Firmaya ait tüm gelen talepleri listeler (GET /firm/referrals). JWT gereklidir.
 */
export const fetchFirmReferrals = (): Promise<IReferralRequestOut[]> => {
    // Backend: /api/core/firm/my-referrals
    return callApi<IReferralRequestOut[]>('core/firm/my-referrals', 'GET', null, true);
};

/**
 * Gelen talebin durumunu günceller (POST /firm/referrals/{id}/action). JWT gereklidir.
 */
export const handleReferralAction = (id: number, action: 'accept' | 'reject'): Promise<any> => {
    // Backend: /api/core/company/request/{id}/action
    return callApi<any>(`core/company/request/${id}/action`, 'POST', { action }, true);
};


// 3. FİRMA KULLANICI YÖNETİMİ API FONKSİYONLARI (JWT ve IsFirmManager GEREKLİ)
// =======================================================

/**
 * Firmaya ait tüm çalışanları listeler (GET /firm/management/users). JWT ve IsFirmEmployee gereklidir.
 */
export const fetchFirmEmployees = (): Promise<IUser[]> => {
    // Endpoint: api/core/firm/management/users
    return callApi<IUser[]>('core/firm/management/users', 'GET', null, true);
};

/**
 * Yeni bir firma çalışanı oluşturur (POST /firm/management/users). JWT ve IsFirmManager gereklidir.
 */
export const createFirmEmployee = (payload: FirmEmployeeCreatePayload): Promise<IUser> => {
    // Endpoint: api/firm/management/users
    return callApi<IUser>('core/firm/management/users', 'POST', payload, true);
};

/**
 * Firma çalışanının yetkisini günceller (PUT /firm/management/users/{id}). JWT ve IsFirmManager gereklidir.
 */
export const updateFirmEmployeeRole = (userId: number, payload: FirmEmployeeUpdatePayload): Promise<IUser> => {
    // Endpoint: api/firm/management/users/{userId}
    return callApi<IUser>(`core/firm/management/users/${userId}`, 'PUT', payload, true);
};

/**
 * Firma çalışanını siler (DELETE /firm/management/users/{id}). JWT ve IsFirmManager gereklidir.
 */
export const deleteFirmEmployee = (userId: number): Promise<void> => {
    // Endpoint: api/firm/management/users/{userId}
    return callApi<void>(`core/firm/management/users/${userId}`, 'DELETE', null, true);
};

// =======================================================
// ADMIN / GLOBAL API FONKSİYONLARI
// =======================================================

/**
 * Admin: Tüm sistemdeki talepleri çeker. (JWT gerektirir)
 * Backend endpoint'inizi uygun şekilde güncelleyin (örn: admin/referrals veya core/referrals/all)
 */
export const fetchAllReferrals = (): Promise<IReferralRequestOut[]> => {
    return callApi<IReferralRequestOut[]>('core/admin/referrals', 'GET', null, true);
};