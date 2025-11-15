import { useState, useEffect, useCallback } from 'react';

// axios yerine fetch kullanacağız
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse(res: Response) {
    if (res.status === 204) return null;
    const text = await res.text();
    try {
        return JSON.parse(text || 'null');
    } catch {
        return text;
    }
}

export interface Address {
    id: number;
    full_address: string;
    street: string;
    district: string;
    city: string;
    postal_code: string;
    phone: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface AddressInput {
    full_address: string;
    street: string;
    district: string;
    city: string;
    postal_code: string;
    phone: string;
    is_default?: boolean;
}

export const useAddresses = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Adresleri yükle
    const fetchAddresses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/users/addresses`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Adresler yükleme hatası');
            const data = await handleResponse(res);
            setAddresses(data || []);
        } catch (err: any) {
            setError(err.message || 'Adresler yükleme hatası');
        } finally {
            setLoading(false);
        }
    }, []);

    // Yeni adres oluştur
    const createAddress = useCallback(async (data: AddressInput) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/users/addresses`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Adres oluşturma hatası');
            const newAddress = await handleResponse(res);
            setAddresses((prev) => [newAddress, ...prev]);
            return newAddress;
        } catch (err: any) {
            setError(err.message || 'Adres oluşturma hatası');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Adres güncelle
    const updateAddress = useCallback(async (id: number, data: AddressInput) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/users/addresses/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Adres güncelleme hatası');
            const updatedAddress = await handleResponse(res);
            setAddresses((prev) =>
                prev.map((addr) => (addr.id === id ? updatedAddress : addr))
            );
            return updatedAddress;
        } catch (err: any) {
            setError(err.message || 'Adres güncelleme hatası');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Adres sil
    const deleteAddress = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/users/addresses/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Adres silme hatası');
            setAddresses((prev) => prev.filter((addr) => addr.id !== id));
        } catch (err: any) {
            setError(err.message || 'Adres silme hatası');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Varsayılan adres ayarla
    const setDefaultAddress = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/users/addresses/${id}/default`, {
                method: 'PUT',
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Varsayılan adres ayarlama hatası');
            const updatedAddress = await handleResponse(res);
            setAddresses((prev) =>
                prev.map((addr) =>
                    addr.id === id
                        ? { ...addr, is_default: true }
                        : { ...addr, is_default: false }
                )
            );
            return updatedAddress;
        } catch (err: any) {
            setError(err.message || 'Varsayılan adres ayarlama hatası');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchAddresses();
        }
    }, [fetchAddresses]);

    return {
        addresses,
        loading,
        error,
        fetchAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
    };
};
