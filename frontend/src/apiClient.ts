// frontend/src/apiClient.ts

import { type IService, type IReferralRequestIn, type IReferralRequestOut } from './types/api';

// Django API'mizin temel adresi. CORS ayarlarını yaptığımız için sorunsuz çalışacaktır.
const API_BASE_URL = 'http://127.0.0.1:8000/api/core';

/**
 * Genel API çağrısı yapıcı fonksiyon
 * @param endpoint - API'deki yol (örn: 'services/search')
 * @param method - HTTP metodu (GET, POST)
 * @param data - POST veya PUT ile gönderilecek veri
 * @returns Sunucudan gelen veriyi döner
 */
async function callApi<T>(
  endpoint: string,
  method: 'GET' | 'POST',
  data: any = null
): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  // Headers (Başlıklar)
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

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
      // Sunucu 4xx veya 5xx kodu döndürdüyse (örn: 400 Bad Request)
      const errorData = await response.json();
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
    // Sorgu parametrelerini oluştur
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (location) params.append('location', location);
    
    // endpoint'e sorgu parametrelerini ekle
    const endpoint = `services/search?${params.toString()}`;
    
    // callApi'ye beklenen tipi (IService dizisi) veriyoruz.
    return callApi<IService[]>(endpoint, 'GET');
};

/**
 * Yeni bir hizmet talebi oluşturur (POST /referral/create).
 * @param payload - Gönderilecek talep verisi
 */
export const createReferral = (payload: IReferralRequestIn): Promise<IReferralRequestOut> => {
    // callApi'ye beklenen tipi (IReferralRequestOut) veriyoruz.
    return callApi<IReferralRequestOut>('referral/create', 'POST', payload);
};