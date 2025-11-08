// frontend/src/apiClient.ts

import { type IService, type IReferralRequestIn, type IReferralRequestOut } from './types/api';

// Django API'mizin temel adresi. CORS ayarlarını yaptığımız için sorunsuz çalışacaktır.
const API_BASE_URL = 'http://127.0.0.1:8000/api/core';

/**
 * Genel API çağrısı yapıcı fonksiyon
 * @param endpoint - API'deki yol (örn: 'services/search')
 * @param method - HTTP metodu (GET, POST)
 * @param data - POST veya PUT ile gönderilecek veri
 * @param requiresAuth - JWT token'ı gerektirip gerektirmediği (Varsayılan: false) <-- YENİ PARAMETRE
 * @returns Sunucudan gelen veriyi döner
 */
async function callApi<T>(
    endpoint: string,
    method: 'GET' | 'POST',
    data: any = null,
    requiresAuth: boolean = false // <-- Varsayılan olarak false
): Promise<T> {
    const url = `${API_BASE_URL}/${endpoint}`;
    
    // Headers (Başlıklar)
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // JWT KONTROLÜ VE EKLEME
    if (requiresAuth) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            // Token yoksa ve yetkilendirme gerekiyorsa hata fırlat
            throw new Error("Yetkilendirme token'ı bulunamadı. Lütfen giriş yapın.");
        }
        // Authorization başlığını ekle
        headers['Authorization'] = `Bearer ${token}`; // <-- Authorization başlığı eklendi
    }

    // Ayarlar (options)
    const options: RequestInit = {
        method,
        headers,
        // POST isteklerinde Body'yi ekliyoruz
        body: data ? JSON.stringify(data) : undefined,
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // Sunucu 4xx veya 5xx kodu döndürdüyse
            const errorData = await response.json().catch(() => ({ detail: 'Sunucu hatası' }));
            // Hata mesajını daha anlaşılır fırlat
            throw new Error(errorData.detail || `API isteği başarısız oldu: ${response.status}`);
        }

        // Cevap body'si boşsa (örn: 204 No Content), null dön
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null as T;
        }

        // JSON verisini al
        return response.json() as Promise<T>;

    } catch (error) {
        console.error(`[API ERROR] ${method} ${url}`, error);
        // Hatanın çağrı yapan bileşen tarafından yakalanabilmesi için yeniden fırlatıyoruz.
        throw error;
    }
}

// =======================================================
// 1. MÜŞTERİ İÇİN API FONKSİYONLARI
// =======================================================

/**
 * Hizmetleri arar (GET /services/search).
 * @param query - Arama kelimesi (örn: 'tamir')
 * @param location - Konum (örn: 'İstanbul')
 */
export const searchServices = (query: string = '', location: string = ''): Promise<IService[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (location) params.append('location', location);
    
    const endpoint = `services/search?${params.toString()}`;
    // Müşteri rotaları JWT gerektirmez, bu yüzden 4. parametre atlanır (false varsayılır)
    return callApi<IService[]>(endpoint, 'GET');
};

/**
 * Yeni bir hizmet talebi oluşturur (POST /referral/create).
 * @param payload - Gönderilecek talep verisi
 */
export const createReferral = (payload: IReferralRequestIn): Promise<IReferralRequestOut> => {
    // Müşteri rotaları JWT gerektirmez, bu yüzden 4. parametre atlanır (false varsayılır)
    return callApi<IReferralRequestOut>('referral/create', 'POST', payload);
};


// =======================================================
// 2. YETKİLENDİRİLMİŞ (FİRMA) API FONKSİYONLARI
// =======================================================

/**
 * Firmaya ait tüm talepleri listeler (GET /firm/my-referrals). JWT gereklidir.
 */
export const fetchFirmReferrals = (): Promise<IReferralRequestOut[]> => {
    // BURADA REQUIRESAUTH: TRUE GÖNDERİLİYOR
    return callApi<IReferralRequestOut[]>('firm/my-referrals', 'GET', null, true); 
};

/**
 * Bir talebi kabul veya red eder (POST /company/request/{id}/action). JWT gereklidir.
 * @param requestId - Talep ID'si
 * @param action - Kabul ('accept') veya Red ('reject')
 */
export const handleReferralAction = (
    requestId: number, 
    action: 'accept' | 'reject'
): Promise<{ success: boolean; message: string }> => {
    
    const payload = { action };

    // BURADA REQUIRESAUTH: TRUE GÖNDERİLİYOR
    return callApi<{ success: boolean; message: string }>(
        `company/request/${requestId}/action`, 
        'POST', 
        payload, 
        true // JWT token gereklidir
    );
};