export interface ICategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export interface ICompany {
    id: number;
    name: string;
    slug: string;
    description: string;
    location: string;
    location_text: string;
}

export interface IService {
    id: number;
    title: string;
    description: string;
    price_range: string;
    price_range_min: number | null;
    price_range_max: number | null;
    company: ICompany;
    company_name: string;
    category?: string;
}

export interface UserCredentials {
    email: string;
    password: string;
}

export interface IRegisterIn {
    username: string;
    email: string;
    full_name: string;
    password: string;
    is_firm: boolean;
}

export interface ILoginOut {
    access: string;
    refresh: string;
    is_superuser: boolean;
    is_firm_manager: boolean;
    id: number;
    full_name: string | null;
}

export interface IReferralRequestIn {
    target_company_id: number;
    requested_service_id: number;
    customer_name: string;
    customer_email: string;
    description: string;
}

export interface IReferral {
    id: number;
    customer_name: string;
    customer_email: string;
    description: string;
    created_at: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    target_company: ICompany;
    requested_service: IService;
}

export interface IEmployee {
    id: number;
    username: string;
    email: string;
    full_name: string;
    company: number;
}

export interface FilterOptions {
    priceMin?: number;
    priceMax?: number;
    location?: string;
    category?: string;
    sortBy?: 'price' | 'name' | 'recent';
    sortOrder?: 'asc' | 'desc';
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    emailUpdates: boolean;
}

export interface RecentSearch {
    id: string;
    query: string;
    location: string;
    timestamp: number;
}

export interface FavoriteService {
    serviceId: number;
    service: IService;
    addedAt: number;
}
