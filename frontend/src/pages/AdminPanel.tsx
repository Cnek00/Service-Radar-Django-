// frontend/src/pages/AdminPanel.tsx

import { useState, useEffect } from 'react';
import { type IReferralRequestOut } from '../types/api';
// Yeni eklediğimiz admin fonksiyonunu import ediyoruz
import { fetchAllReferrals, handleReferralAction } from '../apiClient';
import { CheckCircle, XCircle, Clock, Building2, User, Mail, Zap, Calendar } from 'lucide-react';

export default function AdminPanel() {
    const [referrals, setReferrals] = useState<IReferralRequestOut[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

    const loadReferrals = async () => {
        try {
            setIsLoading(true);
            // Tüm sistemdeki talepleri çekmek için Admin API fonksiyonunu çağır
            const data = await fetchAllReferrals();
            // Tarihe göre ters sıralama (en yeni en üstte)
            const sortedData = data.sort((a: IReferralRequestOut, b: IReferralRequestOut) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setReferrals(sortedData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Talepler Admin yetkisiyle yüklenemedi';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReferrals();
    }, []);

    // Firma Paneli ile aynı aksiyon fonksiyonunu kullanır
    const handleStatusUpdate = async (id: number, status: 'accept' | 'reject') => {
        try {
            await handleReferralAction(id, status);
            // Başarılı olursa listeyi yeniden yükle
            await loadReferrals();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Durum güncellenemedi';
            setError(errorMessage);
        }
    };

    const getStatusColor = (status: 'pending' | 'accepted' | 'rejected') => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const filteredReferrals = referrals.filter(r => filter === 'all' || r.status === filter);


    if (isLoading) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <div className="text-xl font-semibold text-blue-600">Tüm Sistem Talepleri Yükleniyor...</div>
            </div>
        );
    }

    // Hata durumunda (Örn: Admin yetkisi yoksa)
    if (error && filteredReferrals.length === 0 && !isLoading) {
        return (
            <div className="min-h-[500px] flex items-center justify-center">
                <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-red-700 max-w-lg text-center">
                    <Zap className="w-8 h-8 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Erişim Reddedildi</h2>
                    <p>{error}</p>
                    <p className="mt-4 text-sm">Bu panele erişim için Süper Yönetici (Admin) yetkisine sahip olmalısınız.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-2">Admin: Tüm Sistem Talepleri Yönetimi</h1>

                {/* Filtreleme Butonları */}
                <div className="flex space-x-3 mb-8">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}>
                        Tümü ({referrals.length})
                    </button>
                    <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-full font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}>
                        Bekleyen ({referrals.filter(r => r.status === 'pending').length})
                    </button>
                    <button onClick={() => setFilter('accepted')} className={`px-4 py-2 rounded-full font-medium transition-colors ${filter === 'accepted' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}>
                        Kabul Edilen ({referrals.filter(r => r.status === 'accepted').length})
                    </button>
                    <button onClick={() => setFilter('rejected')} className={`px-4 py-2 rounded-full font-medium transition-colors ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}>
                        Reddedilen ({referrals.filter(r => r.status === 'rejected').length})
                    </button>
                </div>

                {filteredReferrals.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-lg shadow-md mt-12">
                        <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-600">Filtrenize uygun talep bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredReferrals.map((referral) => (
                            <div key={referral.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                <div className="flex justify-between items-start mb-4 border-b pb-3">
                                    <div>
                                        <div className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(referral.status)}`}>
                                            <Clock className="w-4 h-4 mr-1" />
                                            {referral.status === 'pending' && 'BEKLEYEN TALEP'}
                                            {referral.status === 'accepted' && 'KABUL EDİLDİ'}
                                            {referral.status === 'rejected' && 'REDDEDİLDİ'}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(referral.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center space-x-2 text-gray-800">
                                        <User className="w-5 h-5 text-blue-500" />
                                        <span className="font-semibold">{referral.customer_name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Mail className="w-5 h-5 text-blue-500" />
                                        <span className="truncate">{referral.customer_email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Building2 className="w-5 h-5 text-blue-500" />
                                        {/* Talep hangi firmaya ait, Admin'e bu bilgiyi göster */}
                                        <span className="font-medium text-gray-900">{referral.target_company?.name ?? `Firma ID:${referral.target_company_id}`}</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-1">Talep Detayı:</h4>
                                    <p className="text-gray-600 text-sm">{referral.description}</p>
                                </div>

                                {/* Aksiyon Butonları (Admin bu aksiyonları yapabilir) */}
                                {referral.status === 'pending' && (
                                    <div className="mt-6 flex space-x-3 justify-end">
                                        <button
                                            onClick={() => handleStatusUpdate(referral.id, 'accept')}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                                        >
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Kabul Et
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(referral.id, 'reject')}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                                        >
                                            <XCircle className="w-5 h-5 mr-2" />
                                            Reddet
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}