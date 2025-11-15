import { useState, useEffect } from 'react';
import { Settings, Loader2, MapPin, Phone, Mail, DollarSign, Clock, Calendar } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

interface CompanyData {
    id: number;
    name: string;
    description: string;
    location_text: string;
    phone?: string;
    email?: string;
    tax_number?: string;
    trade_registry_number?: string;
    logo?: string;
    cover_image?: string;
    working_hours?: Record<string, any>;
    special_days?: Record<string, any>;
    min_order_amount?: number;
    default_delivery_fee?: number;
    estimated_delivery_time_minutes?: number;
    delivery_areas?: Record<string, any>;
}

export default function FirmSettings() {
    const [company, setCompany] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/core/firm/company`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) throw new Error(`Şirket bilgisi yüklenemedi: ${res.status}`);
            const data = await res.json();
            setCompany(data);
        } catch (err: any) {
            setError(err?.message || 'Hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        if (company) {
            setCompany({ ...company, [field]: value });
        }
    };

    const handleSave = async () => {
        if (!company) return;
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`${API_BASE}/api/core/firm/company`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(company),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Kaydetme başarısız: ${res.status}`);
            }

            const data = await res.json();
            setCompany(data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err?.message || 'Kaydetme başarısız');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <p>Şirket bilgisi yükleniyor...</p>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">Şirket bilgisi bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center border-b pb-4">
                <Settings className="w-6 h-6 mr-2 text-blue-600" />
                <h2 className="text-2xl font-semibold">Firma Ayarları</h2>
            </div>

            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    ✓ Ayarlar başarıyla kaydedildi.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Firma Adı */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı</label>
                    <input
                        type="text"
                        value={company.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Açıklama */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea
                        value={company.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                    />
                </div>

                {/* Konum */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" /> Konum
                    </label>
                    <input
                        type="text"
                        value={company.location_text || ''}
                        onChange={(e) => handleChange('location_text', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Telefon */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Phone className="w-4 h-4 mr-1" /> Telefon
                    </label>
                    <input
                        type="tel"
                        value={company.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* E-posta */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Mail className="w-4 h-4 mr-1" /> E-posta
                    </label>
                    <input
                        type="email"
                        value={company.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Vergi Numarası */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
                    <input
                        type="text"
                        value={company.tax_number || ''}
                        onChange={(e) => handleChange('tax_number', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Ticaret Odası Kayıt */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ticaret Odası Kayıt No</label>
                    <input
                        type="text"
                        value={company.trade_registry_number || ''}
                        onChange={(e) => handleChange('trade_registry_number', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Minimum Sipariş Tutarı */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" /> Min. Sipariş Tutarı (TL)
                    </label>
                    <input
                        type="number"
                        value={company.min_order_amount || 0}
                        onChange={(e) => handleChange('min_order_amount', Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Varsayılan Kargo Ücreti */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" /> Varsayılan Kargo Ücreti (TL)
                    </label>
                    <input
                        type="number"
                        value={company.default_delivery_fee || 0}
                        onChange={(e) => handleChange('default_delivery_fee', Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Tahmini Teslimat Süresi */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Clock className="w-4 h-4 mr-1" /> Tahmini Teslimat Süresi (dakika)
                    </label>
                    <input
                        type="number"
                        value={company.estimated_delivery_time_minutes || 0}
                        onChange={(e) => handleChange('estimated_delivery_time_minutes', Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Kaydet Butonu */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                    onClick={fetchCompany}
                    disabled={loading || saving}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    İptal
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading || saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </div>
    );
}
