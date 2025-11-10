// frontend/src/pages/ReferralList.tsx 

import { useState, useEffect } from 'react';
import { type IReferralRequestOut } from '../types/api';
import { CheckCircle, XCircle, Clock, Building2, User, Mail, Zap, Calendar, Loader2 } from 'lucide-react';
import { fetchFirmReferrals, handleReferralAction } from '../apiClient';

export default function ReferralList() {
    const [referrals, setReferrals] = useState<IReferralRequestOut[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadReferrals = async () => {
        try {
            setIsLoading(true);
            const data = await fetchFirmReferrals();
            setReferrals(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Veriler yüklenemedi';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReferrals();
    }, []);

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
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 mr-2 animate-spin text-blue-600" />
                <div className="text-xl font-semibold text-blue-600">Talepler Yükleniyor...</div>
            </div>
        );
    }
    
    return (
        <div className="min-h-[500px]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Gelen Hizmet Talep Listesi</h2>

            {error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    Hata: {error}
                </div>
            )}

            {referrals.length === 0 ? (
                <div className="p-10 text-center bg-gray-50 rounded-lg shadow-inner">
                    <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Henüz size ulaşan bir talep bulunmamaktadır.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {referrals.map((referral) => (
                        <div key={referral.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4 border-b pb-3">
                                <div>
                                    <div className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(referral.status)}`}>
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
                                    <span className="font-medium">{referral.requested_service.title}</span>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-700 mb-1">Talep Detayı:</h4>
                                <p className="text-gray-600 text-sm">{referral.description}</p>
                            </div>

                            {/* Aksiyon Butonları */}
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
    );
}