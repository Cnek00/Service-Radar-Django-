// frontend/src/pages/ReferralList.tsx (GÜNCELLENDİ)

import { useState, useEffect, useCallback } from 'react';
import { type IReferralRequestOut } from '../types/api';
import { 
    CheckCircle, XCircle, Clock, User, Mail, Zap, Calendar, Loader2, MessageSquare 
} from 'lucide-react';
import { fetchFirmReferrals, handleReferralAction } from '../apiClient';

// YENİ BİLEŞENİ İMPORT ET
import Button from '../components/Button';

// Durum etiketi için yardımcı fonksiyon (Mevcut haliyle korundu)
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
    const [isLoading, setIsLoading] = useState(true); // Genel yükleme
    const [error, setError] = useState('');
    
    // YENİ STATE: Hangi talebin işlendiğini tutar (bir talep işlenirken diğerleri kilitlenir)
    const [updatingReferralId, setUpdatingReferralId] = useState<number | null>(null); 
    
    // Talepleri yükleme fonksiyonu (Mevcut haliyle korundu)
    const loadReferrals = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await fetchFirmReferrals();
            const sortedData = data.sort((a: IReferralRequestOut, b: IReferralRequestOut) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setReferrals(sortedData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Talepler yüklenemedi';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReferrals();
    }, [loadReferrals]);


    // handleStatusUpdate GÜNCELLENDİ: Loading durumunu yönetir
    const handleStatusUpdate = useCallback(
        async (referralId: number, action: 'accept' | 'reject') => {
            // İşlem zaten yapılıyorsa durdur
            if (updatingReferralId !== null) return; 
            
            setUpdatingReferralId(referralId); // İşlem yapılan talebin ID'sini kaydet
            setError('');

            try {
                // API çağrısı
                await handleReferralAction(referralId, action);
                
                // Başarılı olursa, tüm listeyi yeniden yükle
                // Alternatif olarak sadece ilgili referral'ın status'ünü güncelleyebiliriz
                await loadReferrals(); 

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Durum güncellenemedi';
                setError(`Talep ${referralId} için işlem başarısız: ${errorMessage}`);
            } finally {
                setUpdatingReferralId(null); // İşlem bitince loading state'ini temizle
            }
        },
        [loadReferrals, updatingReferralId]
    );

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3 flex items-center">
                <Clock className="w-7 h-7 mr-3 text-blue-600" /> Gelen Hizmet Talepleri
            </h1>
            
            {/* Hata ve Yükleme Mesajları */}
            {error && (
                <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-10 text-gray-500 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Talepler Yükleniyor...
                </div>
            ) : referrals.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p className="text-lg">Henüz size ulaşan bir hizmet talebi bulunmamaktadır.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {referrals.map((referral) => {
                        // Yeni: Bu talep için yükleme yapılıyor mu?
                        const isUpdating = updatingReferralId === referral.id; 
                        
                        return (
                            <div 
                                key={referral.id} 
                                // Stil güncellemesi: Duruma göre hafif bir kenarlık rengi
                                className={`bg-white p-6 rounded-xl shadow-lg border-l-4 
                                    ${referral.status === 'pending' ? 'border-yellow-500' 
                                        : referral.status === 'accepted' ? 'border-green-500' 
                                        : 'border-red-500'}`
                                }
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {referral.requested_service.title}
                                    </h2>
                                    {getStatusBadge(referral.status)}
                                </div>

                                {/* Talep Detayları */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                    <p className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-gray-500" />
                                        Müşteri: <span className="font-medium ml-1">{referral.customer_name}</span>
                                    </p>
                                    <p className="flex items-center">
                                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                        E-posta: <span className="font-medium ml-1">{referral.customer_email}</span>
                                    </p>
                                    <p className="flex items-center">
                                        <Zap className="w-4 h-4 mr-2 text-gray-500" />
                                        Komisyon Miktarı: <span className="font-medium ml-1">{referral.commission_amount} TL</span>
                                    </p>
                                    <p className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                        Talep Tarihi: <span className="font-medium ml-1">{new Date(referral.created_at).toLocaleDateString()}</span>
                                    </p>
                                </div>
                                
                                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="flex items-center text-gray-800 mb-2 font-medium">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Müşteri Notu:
                                    </div>
                                    <p className="text-gray-600 text-sm italic">
                                        {referral.description || 'Müşteri ek bir açıklama yapmamıştır.'}
                                    </p>
                                </div>

                                {/* Aksiyon Butonları - YENİ BUTON BİLEŞENİ KULLANILDI */}
                                {referral.status === 'pending' && (
                                    <div className="mt-4 flex space-x-3 justify-end">
                                        {/* KABUL ET BUTONU */}
                                        <Button
                                            onClick={() => handleStatusUpdate(referral.id, 'accept')}
                                            variant="success"
                                            isLoading={isUpdating} // İlgili talep için loading göster
                                            icon={CheckCircle}
                                        >
                                            Kabul Et
                                        </Button>
                                        
                                        {/* REDDET BUTONU */}
                                        <Button
                                            onClick={() => handleStatusUpdate(referral.id, 'reject')}
                                            variant="danger"
                                            isLoading={isUpdating} // İlgili talep için loading göster
                                            icon={XCircle}
                                        >
                                            Reddet
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}