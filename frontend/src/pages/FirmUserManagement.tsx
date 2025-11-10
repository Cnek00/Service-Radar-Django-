// frontend/src/pages/FirmUserManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchFirmEmployees,
    createFirmEmployee,
    updateFirmEmployeeRole,
    deleteFirmEmployee
} from '../apiClient';
import { type IUser, type FirmEmployeeCreatePayload } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { Users, UserPlus, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Yeni çalışan oluşturma formu için başlangıç state'i
const initialCreateFormData: FirmEmployeeCreatePayload = {
    email: '',
    username: '',
    full_name: '',
    password: '',
};

export default function FirmUserManagement() {
    // useAuth'tan hem yetkilendirme durumunu hem de mevcut kullanıcının firma yöneticisi olup olmadığını alıyoruz.
    const { isAuthenticated, isCompanyManager, auth } = useAuth();

    // Veri state'leri
    const [employees, setEmployees] = useState<IUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state'leri
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState<FirmEmployeeCreatePayload>(initialCreateFormData);
    const [isCreating, setIsCreating] = useState(false);

    // Kullanıcı listesini Backend'den çekme fonksiyonu
    const loadEmployees = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setIsLoading(true);
            setError('');
            const data = await fetchFirmEmployees();
            setEmployees(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Çalışan listesi yüklenemedi.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // Bileşen yüklendiğinde ve auth durumu değiştiğinde veriyi çek
    useEffect(() => {
        loadEmployees();
    }, [loadEmployees]);

    // --- CRUD İşlemleri ---

    // Yeni Çalışan Oluşturma
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError('');

        try {
            await createFirmEmployee(createFormData);
            await loadEmployees(); // Başarılı olursa listeyi yenile
            setCreateFormData(initialCreateFormData);
            setIsCreateModalOpen(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Çalışan oluşturulurken hata oluştu.';
            setError(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    // Çalışanın Yöneticilik Yetkisini Güncelleme
    const handleToggleManagerRole = async (employee: IUser) => {
        if (!isCompanyManager) {
            alert('Bu işlemi yapmak için yetkiniz yok.');
            return;
        }

        if (employee.id === auth?.id && employee.is_firm_manager && !employee.is_firm_manager) {
            alert('Kendi yöneticilik yetkinizi kaldıramazsınız.');
            return;
        }

        try {
            await updateFirmEmployeeRole(employee.id, { is_firm_manager: !employee.is_firm_manager });
            await loadEmployees();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Yetki güncellenemedi.';
            setError(errorMessage);
        }
    };

    // Çalışan Silme
    const handleDeleteEmployee = async (employeeId: number) => {
        if (!isCompanyManager) {
            alert('Bu işlemi yapmak için yetkiniz yok.');
            return;
        }

        if (!window.confirm('Bu çalışanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            return;
        }

        try {
            await deleteFirmEmployee(employeeId);
            await loadEmployees();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Çalışan silinemedi.';
            setError(errorMessage);
        }
    };


    // --- Yardımcı Bileşenler ve Render ---

    // Yeni Çalışan Oluşturma Modalı
    const CreateEmployeeModal: React.FC = () => {
        if (!isCreateModalOpen) return null;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setCreateFormData({
                ...createFormData,
                [e.target.name]: e.target.value,
            });
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4">Yeni Çalışan Ekle</h3>
                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="username"
                            placeholder="Kullanıcı Adı"
                            value={createFormData.username}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="E-posta"
                            value={createFormData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="text"
                            name="full_name"
                            placeholder="Ad Soyad"
                            value={createFormData.full_name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Şifre"
                            value={createFormData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setError('');
                                }}
                                className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                            >
                                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isCreating ? 'Ekleniyor...' : 'Ekle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };


    // Ana Bileşen Render
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-7 h-7 mr-3 text-blue-600" />
                Firma Çalışanları Yönetimi
            </h1>

            {isLoading ? (
                <div className="min-h-[300px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 mr-2 animate-spin text-blue-600" />
                    <div className="text-xl font-semibold text-blue-600">Çalışanlar Yükleniyor...</div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">Firmanıza ait **{employees.length}** çalışan listeleniyor.</p>
                        {isCompanyManager && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <UserPlus className="w-5 h-5 mr-2" />
                                Yeni Çalışan Ekle
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad / Kullanıcı Adı</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map((employee) => (
                                    <tr key={employee.id} className={employee.is_firm_manager ? 'bg-yellow-50/50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {employee.full_name}<br />
                                            <span className="text-xs text-gray-500">@{employee.username}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {employee.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.is_firm_manager ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {employee.is_firm_manager ? 'Firma Yöneticisi' : 'Çalışan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {isCompanyManager ? (
                                                <div className="flex justify-end space-x-2">
                                                    {/* Yöneticilik Yetkisini Güncelleme */}
                                                    <button
                                                        onClick={() => handleToggleManagerRole(employee)}
                                                        className={`p-2 rounded-full transition-colors ${employee.is_firm_manager ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}
                                                        title={employee.is_firm_manager ? 'Yöneticilik Yetkisini Kaldır' : 'Yönetici Yap'}
                                                        disabled={employee.id === auth?.id}
                                                    >
                                                        {employee.is_firm_manager ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                                    </button>

                                                    {/* Silme */}
                                                    <button
                                                        onClick={() => handleDeleteEmployee(employee.id)}
                                                        className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                                        title="Çalışanı Sil"
                                                        disabled={employee.id === auth?.id}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Yetkisiz</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <CreateEmployeeModal />
        </div>
    );
}