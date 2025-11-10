// frontend/src/pages/ReferralList.tsx 

import { useState, useEffect, useCallback } from 'react';
import { type IReferralRequestOut } from '../types/api';
import { CheckCircle, XCircle, Clock, User, Mail, Zap, Calendar, Loader2, MessageSquare } from 'lucide-react';
import { fetchFirmReferrals, handleReferralAction } from '../apiClient';

// Durum etiketi için yardımcı fonksiyon
const getStatusBadge = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
        case 'accepted':
            return <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Kabul Edildi</span>;
        case 'rejected':
            return <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center"><XCircle className="w-3 h-3 mr-1" /> Reddedildi</span>;
        case 'pending':
        default:
            return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center"><Clock className="w-3 h-3 mr-1" /> Beklemede</span>;
    }
};

export default function ReferralList() {
    const [referrals, setReferrals] = useState<IReferralRequestOut[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadReferrals = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await fetchFirmReferrals();
            // Talepleri en yeni tarihe göre sıralama (varsayımsal created_at alanı)
            const sortedData = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setReferrals(sortedData);
            setError('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Talep listesi yüklenemedi';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReferrals();
    }, [loadReferrals]);

    const handleStatusUpdate = async (id: number, status: 'accept' | 'reject') => {
        if (!window.confirm(`Bu talebi ${status === 'accept' ? 'kabul etmek' : 'reddetmek'} istediğinizden emin misiniz?`)) {
            return;
        }
        
        try {
            // Optimistic Update: Kullanıcıya anında geri bildirim vermek için
            setReferrals(prev => prev.map(r => 
                r.id === id ? { ...r, status: status === 'accept' ? 'accepted' : 'rejected' } : r
            ));
            
            await handleReferralAction(id, status);
            // loadReferrals(); // Backend onayı sonrası listeyi yeniden yüklemek opsiyonel

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Durum güncellenemedi';
            setError(errorMessage);
            // Hata olursa eski haline döndür
            loadReferrals(); 
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12 text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin mr-3" />
                <p className="text-lg">Talepler yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-lg">Hata: {error}</div>;
    }
    
    // YENİ GÖRÜNÜM: Kartlar halinde listeleme
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-blue-600" />
                Gelen Hizmet Talepleri
            </h1>

            {referrals.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <Clock className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Henüz size ulaşan bir talep bulunmamaktadır.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {referrals.map((referral) => (
                        <div key={referral.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            
                            {/* Başlık ve Durum */}
                            <div className="flex justify-between items-start border-b pb-4 mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-blue-700">
                                        {referral.requested_service.title}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(referral.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                {getStatusBadge(referral.status)}
                            </div>

                            {/* Müşteri Bilgileri */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                                <p className="flex items-center text-gray-800">
                                    <User className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="font-medium">{referral.customer_name}</span>
                                </p>
                                <p className="flex items-center text-gray-800">
                                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                    <a href={`mailto:${referral.customer_email}`} className="text-blue-600 hover:text-blue-800">
                                        {referral.customer_email}
                                    </a>
                                </p>
                            </div>

                            {/* Açıklama */}
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                                <h4 className="font-semibold text-gray-700 flex items-center mb-2">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Müşteri Açıklaması
                                </h4>
                                <p className="text-gray-600 text-sm italic">
                                    "{referral.description || "Müşteri detaylı açıklama girmemiştir."}"
                                </p>
                            </div>

                            {/* Aksiyon Butonları */}
                            {referral.status === 'pending' && (
                                <div className="mt-4 flex space-x-3 justify-end">
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
    );
}