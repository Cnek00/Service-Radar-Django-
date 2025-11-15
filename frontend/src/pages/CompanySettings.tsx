import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function CompanySettings() {
    const navigate = useNavigate();
    const [company, setCompany] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('accessToken');
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        (async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/core/firm/company`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Firma bilgileri alınamadı');
                const data = await res.json();
                setCompany(data);
            } catch (e: any) {
                setError(e.message || 'Hata');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [token, navigate]);

    const handleChange = (k: string, v: any) => {
        setCompany((prev: any) => ({ ...prev, [k]: v }));
    };

    const handleSave = async () => {
        if (!token || !company) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/core/firm/company`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(company),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: 'Güncelleme başarısız' }));
                throw new Error(err.detail || 'Güncelleme başarısız');
            }
            const data = await res.json();
            setCompany(data);
            alert('Firma bilgileri güncellendi');
        } catch (e: any) {
            setError(e.message || 'Güncelleme hatası');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !company) return <div>Yükleniyor...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Firma Bilgileri</h2>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            {company ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Firma Adı</label>
                        <input value={company.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full p-2 border rounded" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Açıklama</label>
                        <textarea value={company.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full p-2 border rounded" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Adres / Konum</label>
                            <input value={company.location_text || ''} onChange={e => handleChange('location_text', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Telefon</label>
                            <input value={company.phone || ''} onChange={e => handleChange('phone', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">E-posta</label>
                            <input value={company.email || ''} onChange={e => handleChange('email', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Vergi No</label>
                            <input value={company.tax_number || ''} onChange={e => handleChange('tax_number', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Ticaret Sicil No</label>
                            <input value={company.trade_registry_number || ''} onChange={e => handleChange('trade_registry_number', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Logo URL</label>
                            <input value={company.logo || ''} onChange={e => handleChange('logo', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Min Sipariş Tutarı</label>
                            <input type="number" value={company.min_order_amount || ''} onChange={e => handleChange('min_order_amount', Number(e.target.value) || null)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Varsayılan Teslimat Ücreti</label>
                            <input type="number" value={company.default_delivery_fee || ''} onChange={e => handleChange('default_delivery_fee', Number(e.target.value) || null)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tahmini Teslimat Süresi (dk)</label>
                            <input type="number" value={company.estimated_delivery_time_minutes || ''} onChange={e => handleChange('estimated_delivery_time_minutes', Number(e.target.value) || null)} className="w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Teslimat Bölgeleri (GeoJSON)</label>
                        <textarea value={JSON.stringify(company.delivery_areas || {})} onChange={e => {
                            try {
                                const parsed = JSON.parse(e.target.value || '{}');
                                handleChange('delivery_areas', parsed);
                            } catch (err) {
                                // ignore parse errors until save
                            }
                        }} className="w-full p-2 border rounded" rows={6} />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                            <Save className="w-4 h-4" /> Kaydet
                        </button>
                        <button onClick={() => navigate('/firma-panel')} className="px-4 py-2 bg-gray-200 rounded">Geri</button>
                    </div>
                </div>
            ) : (
                <div>Firma bilgisi yok</div>
            )}
        </div>
    );
}
