// frontend/src/pages/AdminPanel.tsx (GÜNCEL: Button Bileşeni Entegre Edildi)

import { useState, useEffect, useCallback } from 'react';
import { type IReferralRequestOut } from '../types/api';
// Yeni eklediğimiz admin fonksiyonunu import ediyoruz
import { fetchAllReferrals, handleReferralAction } from '../apiClient';
import { 
    CheckCircle, XCircle, Clock, Building2, User, Mail, Zap, Calendar, Loader2, MessageSquare, Filter
} from 'lucide-react';

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

export default function AdminPanel() {
    const [referrals, setReferrals] = useState<IReferralRequestOut[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

    // YENİ STATE: Hangi talebin işlendiğini tutar
    const [updatingReferralId, setUpdatingReferralId] = useState<number | null>(null); 
    
    // Tüm talepleri yükleme fonksiyonu
    const loadReferrals = useCallback(async () => {
        try {
            setIsLoading(true);
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
    
    // Filtrelenmiş talepleri hesapla
    const filteredReferrals = referrals.filter(referral => 
        filter === 'all' || referral.status === filter
    );
    
    // Filtre butonları için yardımcı fonksiyon
    const getFilterButtonClass = (buttonFilter: typeof filter) => 
        `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === buttonFilter 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3 flex items-center">
                    <Building2 className="w-7 h-7 mr-3 text-red-600" /> Admin Paneli: Tüm Sistem Talepleri
                </h1>
                
                {/* Hata ve Yükleme Mesajları */}
                {error && (
                    <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
                        {error}
                    </div>
                )}
                
                {/* Filtreleme Butonları */}
                <div className="flex space-x-3 mb-6 items-center">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 font-medium mr-2">Filtrele:</span>
                    <button onClick={() => setFilter('all')} className={getFilterButtonClass('all')}>
                        Tümü ({referrals.length})
                    </button>
                    <button onClick={() => setFilter('pending')} className={getFilterButtonClass('pending')}>
                        Beklemede ({referrals.filter(r => r.status === 'pending').length})
                    </button>
                    <button onClick={() => setFilter('accepted')} className={getFilterButtonClass('accepted')}>
                        Kabul Edilenler ({referrals.filter(r => r.status === 'accepted').length})
                    </button>
                    <button onClick={() => setFilter('rejected')} className={getFilterButtonClass('rejected')}>
                        Reddedilenler ({referrals.filter(r => r.status === 'rejected').length})
                    </button>
                </div>
                

                {isLoading ? (
                    <div className="text-center py-10 text-gray-500 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Talepler Yükleniyor...
                    </div>
                ) : filteredReferrals.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-md">
                        <p className="text-lg">Gösterilecek hizmet talebi bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredReferrals.map((referral) => {
                            // Yeni: Bu talep için yükleme yapılıyor mu?
                            const isUpdating = updatingReferralId === referral.id; 
                            
                            return (
                                <div 
                                    key={referral.id} 
                                    className={`bg-white p-6 rounded-xl shadow-lg border-l-4 
                                        ${referral.status === 'pending' ? 'border-yellow-500' 
                                            : referral.status === 'accepted' ? 'border-green-500' 
                                            : 'border-red-500'}`
                                    }
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {referral.requested_service.title}
                                        </h2>
                                        {getStatusBadge(referral.status)}
                                    </div>
    
                                    {/* Talep Detayları */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                                        <p className="flex items-center">
                                            <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                            Hedef Firma: <span className="font-medium ml-1">{referral.requested_service.company_name}</span>
                                        </p>
                                        <p className="flex items-center">
                                            <Zap className="w-4 h-4 mr-2 text-gray-500" />
                                            Komisyon Miktarı: <span className="font-medium ml-1 text-purple-600">{referral.commission_amount} TL (Komisyon)</span>
                                        </p>
                                        <p className="flex items-center">
                                            <User className="w-4 h-4 mr-2 text-gray-500" />
                                            Müşteri: <span className="font-medium ml-1">{referral.customer_name}</span>
                                        </p>
                                        <p className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                            E-posta: <span className="font-medium ml-1">{referral.customer_email}</span>
                                        </p>
                                        <p className="flex items-center md:col-span-2">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                            Talep Tarihi: <span className="font-medium ml-1">{new Date(referral.created_at).toLocaleString()}</span>
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
    
                                    {/* Aksiyon Butonları - YENİ BUTTON BİLEŞENİ KULLANILDI */}
                                    {referral.status === 'pending' && (
                                        <div className="mt-6 flex space-x-3 justify-end">
                                            {/* KABUL ET BUTONU */}
                                            <Button
                                                onClick={() => handleStatusUpdate(referral.id, 'accept')}
                                                variant="success"
                                                isLoading={isUpdating} // İlgili talep için loading göster
                                                icon={CheckCircle}
                                            >
                                                Kabul Et (Firmaya İletildi)
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
        </div>
    );
}