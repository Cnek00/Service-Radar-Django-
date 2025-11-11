// frontend/src/types/api.ts

/**
 * Backend API'den gelen verilerin tiplerini tanımlar.
 * Bu, Django REST Framework Serializer'larınız ile uyumlu olmalıdır.
 */

// 1. Company (Firma) Şeması (ServiceSchema'nın içinde)
export interface ICompany {
    id: number;
    name: string;
    slug: string;
    description: string;
    // Django'da location veya location_text olarak tutulabilir
    location: string;
    location_text: string;
}

// 2. Service (Hizmet) Şeması (Arama sonuçlarında ve Talep içinde)
export interface IService {
    id: number;
    title: string;
    description: string;
    // Fiyat aralığı bilgisi
    price_range: string;
    price_range_min: number | null;
    price_range_max: number | null;

    // İlişkili firma bilgisi
    company: ICompany;
    company_name: string; // Kolay erişim için
}

// --------------------------------------------------------------------------------
// KULLANICI VE YETKİLENDİRME TİPLERİ
// --------------------------------------------------------------------------------

/**
 * Giriş (Login) için gönderilen temel veriler.
 * Not: Django'da genelde `username` veya `email` kullanılır, biz `email` kullandık.
 */
export interface UserCredentials {
    email: string;
    password: string;
}

/**
 * Müşteri Kaydı (Register) için gönderilen veriler.
 */
export interface IRegisterIn {
    username: string;
    email: string;
    full_name: string;
    password: string;
    is_firm: boolean;
}

/**
 * Backend'den gelen başarılı Login cevabı.
 */
export interface ILoginOut {
    access: string;
    refresh: string;
    // Kullanıcıya ait temel bilgiler (authService'e kaydedilir)
    user_id: number; // Kullanıcı ID'si (JWT içinde de olabilir)
    is_superuser: boolean;
    is_firm_manager: boolean;
    full_name: string;
    // Backend'de Django-Q kullanıldığı için user.id'yi kaybetmeyelim
    id: number;
}

/**
 * Login işleminin sonucu.
 */
export interface LoginResult {
    success: boolean;
    error?: string;
}

// --------------------------------------------------------------------------------
// FİRMA KAYIT TİPLERİ (Çok Amaçlı)
// --------------------------------------------------------------------------------

/**
 * Firma Kaydı (FirmRegister) için gönderilen veriler.
 * Hem kullanıcı (yönetici) hem de firma bilgilerini içerir.
 */
export interface IFirmRegisterIn {
    // Kullanıcı (Yönetici) Bilgileri
    username: string;
    email: string;
    full_name: string;
    password: string;

    // Firma (Company) Bilgileri
    firm_name: string;
    tax_number: string; // Vergi Numarası/TCKN
    legal_address: string;
    phone_number: string;
    location: string;
    working_hours: string;
    iban: string;
}


// --------------------------------------------------------------------------------
// REFERANS TALEPLERİ (REFERRAL) TİPLERİ
// --------------------------------------------------------------------------------

/**
 * Referral Request Input (Talep Girişi - POST için).
 */
export interface IReferralRequestIn {
    target_company_id: number;
    requested_service_id: number;
    customer_name: string;
    customer_email: string;
    description: string;
}

/**
 * Referral Request Output (Gelen Talep - GET için).
 * Firma Panelinde gösterilir.
 */
export interface IReferralRequestOut {
    id: number;
    target_company_id: number;
    requested_service_id: number;
    customer_name: string;
    customer_email: string;
    description: string;
    status: 'pending' | 'accepted' | 'rejected'; // Durumlar için kesin tipler
    created_at: string; // ISO formatında tarih (Örn: "2025-11-06T18:20:00.000Z")

    // İlişkili objeler
    requested_service: IService;
    commission_amount: number;
    // Bazı backend serializer'ları target_company objesini de dönebilir
    target_company?: ICompany;
}


// --------------------------------------------------------------------------------
// FİRMA KULLANICI YÖNETİMİ TİPLERİ
// --------------------------------------------------------------------------------

// Firma Çalışanı/Kullanıcı Tipi (Backend UserSchema karşılığı)
export interface IUser {
    id: number;
    username: string;
    email: string;
    full_name: string;
    is_firm_manager: boolean; // Firma Yöneticisi mi?
}

// Yeni Çalışan Oluşturma (POST)
export interface FirmEmployeeCreatePayload {
    email: string;
    username: string;
    full_name: string;
    password: string;
}

// Çalışan Rol Güncelleme (PUT)
export interface FirmEmployeeUpdatePayload {
    is_firm_manager: boolean;
}

// src/types/api.ts (Yeni Eklenecekler)

// FİRMA HİZMET YÖNETİMİ TİPLERİ (Oluşturma ve Güncelleme için Ortak Payload)

export interface IServicePayload {
    title: string;
    description: string;
    // Fiyat aralığı bilgisi (örneğin "Pazarlığa Açık" veya "500-1000 TL")
    price_range: string; 
    price_range_min: number | null;
    price_range_max: number | null;
}

// Oluşturma için (Firma ID'si JWT'den alınacak)
export type IServiceCreateIn = IServicePayload;

// Güncelleme için
export type IServiceUpdateIn = IServicePayload;