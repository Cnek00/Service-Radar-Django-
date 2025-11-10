// frontend/src/types/api.ts

import type { ReactNode } from "react";

/**
 * Backend API'den gelen verilerin tiplerini tanımlar.
 * Bu, Pydantic şemalarınız (schemas.py) ile birebir uyumlu olmalıdır.
 */

// 1. Company (Firma) Şeması (ServiceSchema'nın içinde)
export interface ICompany {
    location: any;
    id: number;
    name: string;
    slug: string;
    description: string;
    location_text: string;
}

// 2. Service (Hizmet) Şeması (Arama sonuçlarında ve Talep içinde)
export interface IService {
    price_range: any;
    company_name: string;
    id: number;
    title: string;
    description: string;
    price_range_min: number | null; // float için number kullanıyoruz
    price_range_max: number | null; // null olabilir
    company: ICompany; // İlişkili firma objesi
}

// 3. Referral Request Input (Talep Girişi - POST için)
// Bu, Insomnia'da gönderdiğimiz JSON verisidir.
export interface IReferralRequestIn {
    target_company_id: number;
    requested_service_id: number;
    customer_name: string;
    customer_email: string;
    description: string;
}


// 4. Referral Request Output (Talep Çıkışı - 201 Created yanıtı)
// created_at alanını backend'de datetime olarak ayarladığımız için burada string olarak alıyoruz (ISO formatı)
export interface IReferralRequestOut {
    description: ReactNode;
    user_phone: ReactNode;
    user_email: ReactNode;
    notes: string;
    service: ReactNode;
    id: number;
    customer_name: string;
    customer_email: string;
    status: 'pending' | 'accepted' | 'rejected'; // Durumlar için kesin tipler
    created_at: string; // ISO formatında tarih (Örn: "2025-11-06T18:20:00.000Z")
    requested_service: IService; // İlişkili hizmet objesi (ServiceSchema)
    commission_amount: number;
}