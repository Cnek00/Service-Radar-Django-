// frontend/src/pages/FirmUserManagement.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchFirmEmployees,
    createFirmEmployee,
    updateFirmEmployeeRole,
    deleteFirmEmployee
} from '../apiClient';
import { type IUser, type FirmEmployeeCreatePayload, type FirmEmployeeUpdatePayload } from '../types/api';
import { useAuth } from '../hooks/useAuth'; // Yetki kontrolü için özel hook
import { Users, UserPlus, Trash2, CheckCircle, XCircle, Loader2, Mail, User } from 'lucide-react';
import Modal from '../components/Modal'; // Modal bileşenini kullanıyoruz

// Yeni çalışan oluşturma formu için başlangıç state'i
const initialCreateFormData: FirmEmployeeCreatePayload = {
    email: '',
    username: '',
    full_name: '',
    password: '',
};

// --------------------------------------------------------------------------------
// ANA BİLEŞEN
// --------------------------------------------------------------------------------

export default function FirmUserManagement() {
    // useAuth hook'u, mevcut kullanıcının id, isCompanyManager gibi bilgilerini sağlar
    const { isAuthenticated, isCompanyManager, auth } = useAuth();

    // Veri state'leri
    const [employees, setEmployees] = useState<IUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal ve Form state'leri
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState<FirmEmployeeCreatePayload>(initialCreateFormData);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    // Kullanıcı listesini Backend'den çekme fonksiyonu
    const loadEmployees = useCallback(async () => {
        if (!isAuthenticated) return; // Giriş yapmadıysa yükleme

        try {
            setIsLoading(true);
            const data = await fetchFirmEmployees();
            setEmployees(data);
            setError('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Çalışan listesi yüklenemedi';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadEmployees();
    }, [loadEmployees]);

    // Form işlemleri
    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
    };

    // YENİ ÇALIŞAN OLUŞTURMA
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setCreateError('');

        try {
            const newEmployee = await createFirmEmployee(createFormData);
            setEmployees(prev => [...prev, newEmployee]); // Listeye ekle
            setIsCreateModalOpen(false); // Modalı kapat
            setCreateFormData(initialCreateFormData); // Formu sıfırla
            // onSuccess('Yeni çalışan başarıyla eklendi.'); // Bu sayfada bir bildirim göstermek isterseniz
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu.');
        } finally {
            setIsCreating(false);
        }
    };

    // ÇALIŞAN YETKİSİNİ GÜNCELLEME (Yönetici/Çalışan)
    const handleRoleUpdate = async (employeeId: number, currentRole: boolean) => {
        if (!isCompanyManager) return; // Sadece yönetici yapabilir

        const newRole = !currentRole;
        if (!window.confirm(`Kullanıcının yetkisini ${newRole ? 'Yönetici' : 'Çalışan'} olarak değiştirmek istediğinizden emin misiniz?`)) {
            return;
        }

        const payload: FirmEmployeeUpdatePayload = { is_firm_manager: newRole };

        try {
            // Optimistic Update
            setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, is_firm_manager: newRole } : e));
            await updateFirmEmployeeRole(employeeId, payload);
        } catch (err) {
            // Hata olursa listeyi yeniden yükle
            loadEmployees();
        }
    };

    // ÇALIŞANI SİLME
    const handleDeleteEmployee = async (employeeId: number) => {
        if (!isCompanyManager) return;
        if (!window.confirm("Bu çalışanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            return;
        }

        try {
            // Optimistic Update: Listeden çıkar
            setEmployees(prev => prev.filter(e => e.id !== employeeId));
            await deleteFirmEmployee(employeeId);
            // onSuccess('Çalışan başarıyla silindi.');
        } catch (err) {
            // Hata olursa listeyi yeniden yükle
            loadEmployees();
        }
    };

    // --------------------------------------------------------------------------------
    // RENDER
    // --------------------------------------------------------------------------------

    if (!isAuthenticated || !isCompanyManager) {
        return <div className="p-6 text-red-600 bg-red-50 rounded-lg">Bu sayfaya erişim yetkiniz yoktur.</div>;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12 text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin mr-3" />
                <p className="text-lg">Çalışanlar yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-lg">Hata: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-blue-600" />
                    Çalışan Yönetimi ({employees.length})
                </h1>

                {isCompanyManager && (
                    <button
                        onClick={() => {
                            setCreateFormData(initialCreateFormData);
                            setCreateError('');
                            setIsCreateModalOpen(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Yeni Çalışan Ekle
                    </button>
                )}
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı Adı / E-posta</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pozisyon</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee) => (
                            <tr key={employee.id} className={employee.id === auth?.id ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <span className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-blue-600" />
                                        {employee.full_name}
                                        {employee.id === auth?.id && <span className="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold">Siz</span>}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="block">{employee.username}</span>
                                    <span className="block text-xs text-gray-400 flex items-center mt-1"><Mail className="w-3 h-3 mr-1" />{employee.email}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                    {employee.is_firm_manager ? (
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Yönetici</span>
                                    ) : (
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Çalışan</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {isCompanyManager && employee.id !== auth?.id ? (
                                        <div className="flex justify-center space-x-2">
                                            {/* Yetki Değiştir */}
                                            <button
                                                onClick={() => handleRoleUpdate(employee.id, employee.is_firm_manager)}
                                                className={`p-2 rounded-full transition-colors`}
                                                title={employee.is_firm_manager ? 'Çalışan Yap' : 'Yönetici Yap'}
                                                disabled={!isCompanyManager}
                                            >
                                                {employee.is_firm_manager
                                                    ? <XCircle className="w-5 h-5 text-red-500 hover:text-red-700" />
                                                    : <CheckCircle className="w-5 h-5 text-green-500 hover:text-green-700" />
                                                }
                                            </button>

                                            {/* Silme */}
                                            <button
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                                title="Çalışanı Sil"
                                                disabled={!isCompanyManager}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">İşlem Yok</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* YENİ ÇALIŞAN EKLEME MODALI */}
            {isCompanyManager && (
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Yeni Çalışan Ekle"
                >
                    <form onSubmit={handleCreateSubmit} className="space-y-4">

                        {/* Hata Mesajı */}
                        {createError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {createError}
                            </div>
                        )}

                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                            <input type="text" name="full_name" value={createFormData.full_name} onChange={handleCreateChange} required className="input-field" disabled={isCreating} />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                            <input type="text" name="username" value={createFormData.username} onChange={handleCreateChange} required className="input-field" disabled={isCreating} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
                            <input type="email" name="email" value={createFormData.email} onChange={handleCreateChange} required className="input-field" disabled={isCreating} />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Şifre</label>
                            <input type="password" name="password" value={createFormData.password} onChange={handleCreateChange} required className="input-field" disabled={isCreating} />
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isCreating && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                            {isCreating ? 'Ekleniyor...' : 'Çalışanı Kaydet'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}