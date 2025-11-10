import { useState, useEffect } from 'react';
import { type IReferralRequestOut } from '../types/api';
import { CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';
import { fetchFirmReferrals, handleReferralAction } from '../apiClient';

export default function FirmPanel() {
    const [referrals, setReferrals] = useState<IReferralRequestOut[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadReferrals();
    }, []);

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

    const handleStatusUpdate = async (id: number, status: 'accept' | 'reject') => {
        try {
            await handleReferralAction(id, status);
            await loadReferrals();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Durum güncellenemedi';
            setError(errorMessage);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <Building2 className="w-8 h-8 text-blue-500" />
                        <h1 className="text-3xl font-bold text-gray-900">Firma Paneli</h1>
                    </div>
                    <p className="text-gray-600">Gelen referans taleplerini yönetin</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {referrals.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Henüz referans talebi bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hizmet ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Telefon
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            E-posta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Notlar
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Durum
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tarih
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            İşlemler
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {referrals.map((referral) => (
                                        <tr key={referral.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                #{referral.service}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {referral.user_phone}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {referral.user_email}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                {referral.notes || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${referral.status === 'accepted'
                                                        ? 'bg-green-100 text-green-800'
                                                        : referral.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {referral.status === 'accepted'
                                                        ? 'Kabul Edildi'
                                                        : referral.status === 'rejected'
                                                            ? 'Reddedildi'
                                                            : 'Beklemede'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(referral.created_at).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {referral.status === 'pending' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(referral.id, 'accept')}
                                                            className="inline-flex items-center px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Kabul Et
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(referral.id, 'reject')}
                                                            className="inline-flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                            Reddet
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
