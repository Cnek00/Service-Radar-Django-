import React, { useEffect, useState } from 'react';

interface Referral {
    id: number;
    service_title?: string;
    customer_name?: string;
    created_at?: string;
    status?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function FirmReferralList() {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('accessToken');

    const fetchReferrals = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/core/firm/my-referrals`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            const data = await res.json();
            setReferrals(data || []);
        } catch (err: any) {
            setError(err?.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const performAction = async (id: number, action: 'accept' | 'reject') => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/core/company/request/${id}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`Action failed: ${res.status} ${txt}`);
            }
            await fetchReferrals();
        } catch (err: any) {
            setError(err?.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Firma Talepleri</h2>
            {loading && <p>Yükleniyor...</p>}
            {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {!loading && referrals.length === 0 && <p>Henüz talep yok.</p>}

            <ul className="space-y-3">
                {referrals.map((r) => (
                    <li key={r.id} className="border rounded p-4 bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-lg font-medium">{r.service_title || '—'}</div>
                                <div className="text-sm text-gray-500">Müşteri: {r.customer_name || '—'}</div>
                                <div className="text-sm text-gray-400">Tarih: {r.created_at || '—'}</div>
                            </div>
                            <div className="text-right">
                                <div className="mb-2">Durum: <span className="font-semibold">{r.status || '—'}</span></div>
                                {r.status === 'pending' && (
                                    <div className="space-x-2">
                                        <button
                                            onClick={() => performAction(r.id, 'accept')}
                                            className="px-3 py-1 bg-green-600 text-white rounded"
                                        >
                                            Kabul Et
                                        </button>
                                        <button
                                            onClick={() => performAction(r.id, 'reject')}
                                            className="px-3 py-1 bg-red-600 text-white rounded"
                                        >
                                            Reddet
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
