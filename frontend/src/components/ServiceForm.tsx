import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function ServiceForm({ serviceToEdit, onSuccess, onClose }: any) {
    const [title, setTitle] = useState(serviceToEdit?.title || '');
    const [description, setDescription] = useState(serviceToEdit?.description || '');
    const [priceMin, setPriceMin] = useState(serviceToEdit?.price_range_min || 0);
    const [priceMax, setPriceMax] = useState(serviceToEdit?.price_range_max || 0);
    const [categories, setCategories] = useState<any[]>([]);
    const [category, setCategory] = useState(
        serviceToEdit?.category ? (typeof serviceToEdit.category === 'object' ? serviceToEdit.category.id : serviceToEdit.category) : ''
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/api/core/categories`)
            .then((r) => r.json())
            .then((data) => setCategories(data || []))
            .catch(() => setCategories([]));
    }, []);

    const token = localStorage.getItem('accessToken');

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload: any = {
                title,
                description,
                price_range_min: Number(priceMin),
                price_range_max: Number(priceMax),
                category: category ? Number(category) : null,
            };

            const url = serviceToEdit ? `${API_BASE}/api/core/firm/services/${serviceToEdit.id}` : `${API_BASE}/api/core/firm/services`;
            const method = serviceToEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || `Request failed ${res.status}`);
            }

            await res.json();
            onSuccess(serviceToEdit ? 'Güncellendi' : 'Oluşturuldu');
        } catch (err: any) {
            onSuccess(err?.message || 'Hata');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Başlık</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Fiyat Alt</label>
                    <input type="number" value={priceMin} onChange={(e) => setPriceMin(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Fiyat Üst</label>
                    <input type="number" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select value={category || ''} onChange={(e) => setCategory(e.target.value || null)} className="w-full border rounded px-3 py-2">
                    <option value="">-- Seçiniz --</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded">İptal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Bekleyin...' : serviceToEdit ? 'Güncelle' : 'Oluştur'}</button>
            </div>
        </form>
    );
}
