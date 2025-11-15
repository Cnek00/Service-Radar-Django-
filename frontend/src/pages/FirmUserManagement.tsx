// frontend/src/pages/FirmUserManagement.tsx (GÜNCELLENDİ)

import React, { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
    fetchFirmEmployees,
    createFirmEmployee,
    updateFirmEmployeeRole,
    deleteFirmEmployee
} from '../apiClient';
import { type IUser, type FirmEmployeeCreatePayload, type FirmEmployeeUpdatePayload } from '../types/api';
import { useAuth } from '../hooks/useAuth'; 
import { 
    Users, UserPlus, Trash2, CheckCircle, XCircle, Loader2, Mail, User, Key, UserCheck, UserX 
} from 'lucide-react';

// YENİ BİLEŞENLERİ İMPORT ET
import Modal from '../components/Modal'; 
import Input from '../components/Input'; 
import Button from '../components/Button'; 

// Yeni çalışan oluşturma formu için başlangıç state'i
const initialCreateFormData: FirmEmployeeCreatePayload = {
    email: '',
    username: '',
    full_name: '',
    password: '',
};

// --------------------------------------------------------------------------------
// YARDIMCI BİLEŞEN: YETKİ ROZETİ
// --------------------------------------------------------------------------------

const RoleBadge: React.FC<{ isManager: boolean }> = ({ isManager }) => {
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${
            isManager 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
        }`}>
            {isManager ? <UserCheck className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
            {isManager ? 'Yönetici' : 'Standart Çalışan'}
        </span>
    );
};

// --------------------------------------------------------------------------------
// ANA BİLEŞEN
// --------------------------------------------------------------------------------

export default function FirmUserManagement() {
    const { isCompanyManager, auth } = useAuth();
    const currentUserId = auth.id; // Mevcut oturum açmış kullanıcının ID'si

    // Veri state'leri
    const [employees, setEmployees] = useState<IUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal ve Form state'leri
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState<FirmEmployeeCreatePayload>(initialCreateFormData);
    const [isCreating, setIsCreating] = useState(false);
    
    // YENİ STATE: Silme veya Yetki değiştirme işlemi için ID tutucusu
    const [processingUserId, setProcessingUserId] = useState<number | null>(null);

    // Çalışanları yükleme fonksiyonu
    const loadEmployees = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await fetchFirmEmployees();
            setEmployees(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Çalışanlar yüklenemedi';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isCompanyManager) {
            loadEmployees();
        } else {
            // Yönetici olmayanlar için sadece bir hata/bilgi mesajı gösterilebilir
            setIsLoading(false);
            setError('Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.');
        }
    }, [loadEmployees, isCompanyManager]);

    // Yeni çalışan ekleme form inputları için change handler
    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateFormData({
            ...createFormData,
            [e.target.name]: e.target.value,
        });
    };

    // Yeni çalışan ekleme submit handler
    const handleCreateSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError('');

        try {
            await createFirmEmployee(createFormData);
            setSuccess(`'${createFormData.full_name}' başarıyla eklendi.`);
            setCreateFormData(initialCreateFormData); // Formu temizle
            setIsCreateModalOpen(false); // Modalı kapat
            await loadEmployees(); // Listeyi yeniden yükle
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Kullanıcı eklenirken hata oluştu';
            setError(`Ekleme başarısız: ${errorMessage}`);
        } finally {
            setIsCreating(false);
        }
    };
    
    // Yetki güncelleme handler
    const handleUpdateRole = async (userId: number, currentRole: boolean) => {
        if (processingUserId !== null) return;
        setProcessingUserId(userId);
        setError('');
        
        const newRole: FirmEmployeeUpdatePayload = { is_firm_manager: !currentRole };

        try {
            await updateFirmEmployeeRole(userId, newRole);
            setSuccess(`Kullanıcı yetkisi başarıyla ${!currentRole ? 'Yönetici' : 'Standart Çalışan'} olarak güncellendi.`);
            await loadEmployees();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Yetki güncellenirken hata oluştu';
            setError(`Yetki güncelleme başarısız: ${errorMessage}`);
        } finally {
            setProcessingUserId(null);
        }
    };

    // Çalışan silme handler
    const handleDelete = async (userId: number) => {
        if (!window.confirm("Bu çalışanı silmek istediğinizden emin misiniz?")) return;
        
        if (processingUserId !== null) return;
        setProcessingUserId(userId);
        setError('');

        try {
            await deleteFirmEmployee(userId);
            setSuccess('Çalışan başarıyla silindi.');
            await loadEmployees();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Kullanıcı silinirken hata oluştu';
            setError(`Silme başarısız: ${errorMessage}`);
        } finally {
            setProcessingUserId(null);
        }
    };

    if (!isCompanyManager) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
                <XCircle className="w-8 h-8 mx-auto mb-3" />
                <p className="text-xl font-semibold">Yetkisiz Erişim</p>
                <p className="mt-2">Bu sayfa sadece Firma Yöneticileri tarafından görüntülenebilir.</p>
            </div>
        );
    }
    
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Users className="w-7 h-7 mr-3 text-purple-600" /> Firma Çalışanları
                </h1>
                
                {/* YENİ BUTTON BİLEŞENİ KULLANILDI */}
                <Button 
                    onClick={() => { setIsCreateModalOpen(true); setError(''); setSuccess(''); }}
                    variant="primary"
                    icon={UserPlus}
                >
                    Yeni Çalışan Ekle
                </Button>
            </div>
            
            {/* Hata ve Başarı Mesajları */}
            {error && (
                <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm" role="alert">
                    {success}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-10 text-gray-500 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Çalışanlar Yükleniyor...
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ad Soyad
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kullanıcı Adı / E-posta
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Yetki
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksiyonlar
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.map((employee) => {
                                // YENİ: İşlemde olan kullanıcı kontrolü
                                const isProcessing = processingUserId === employee.id;
                                // YENİ: Mevcut yönetici kendi yetkisini değiştiremez/silemez
                                const isCurrentUser = employee.id === currentUserId; 
                                
                                return (
                                    <tr key={employee.id} className={isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {employee.full_name} {isCurrentUser && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full ml-2">Siz</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <p className="font-medium">{employee.username}</p>
                                            <p className="text-xs text-gray-500">{employee.email}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <RoleBadge isManager={employee.is_firm_manager} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            
                                            {/* YENİ BUTTON BİLEŞENLERİ KULLANILDI */}
                                            {/* Yöneticiler kendi yetkilerini değiştiremezler */}
                                            {!isCurrentUser && (
                                                <Button
                                                    onClick={() => handleUpdateRole(employee.id, employee.is_firm_manager)}
                                                    variant={employee.is_firm_manager ? 'warning' : 'info'}
                                                    isLoading={isProcessing}
                                                    disabled={isProcessing}
                                                    icon={employee.is_firm_manager ? UserX : UserCheck}
                                                    size="sm"
                                                    className="min-w-[120px]"
                                                >
                                                    {employee.is_firm_manager ? 'Standart Yap' : 'Yönetici Yap'}
                                                </Button>
                                            )}
                                            
                                            {/* Kendi hesabını silemezsin */}
                                            {!isCurrentUser && (
                                                <Button
                                                    onClick={() => handleDelete(employee.id)}
                                                    variant="danger"
                                                    isLoading={isProcessing}
                                                    disabled={isProcessing}
                                                    icon={Trash2}
                                                    size="sm"
                                                    className="min-w-[70px]"
                                                >
                                                    Sil
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* YENİ ÇALIŞAN EKLEME MODALI */}
            {isCreateModalOpen && (
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Yeni Çalışan Ekle"
                >
                    {/* Form Hata/Başarı Mesajı */}
                    {error && (
                        <div className="p-3 mb-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 mb-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm" role="alert">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
                        
                        {/* AD SOYAD */}
                        <Input
                            icon={User}
                            type="text"
                            name="full_name"
                            placeholder="Ad Soyad"
                            value={createFormData.full_name}
                            onChange={handleCreateChange}
                            isLoading={isCreating}
                            required
                        />
                        
                        {/* KULLANICI ADI */}
                        <Input
                            icon={User}
                            type="text"
                            name="username"
                            placeholder="Kullanıcı Adı"
                            value={createFormData.username}
                            onChange={handleCreateChange}
                            isLoading={isCreating}
                            required
                        />

                        {/* E-POSTA */}
                        <Input
                            icon={Mail}
                            type="email"
                            name="email"
                            placeholder="E-posta Adresi"
                            value={createFormData.email}
                            onChange={handleCreateChange}
                            isLoading={isCreating}
                            required
                        />

                        {/* ŞİFRE */}
                        <Input
                            icon={Key}
                            type="password"
                            name="password"
                            placeholder="Geçici Şifre"
                            value={createFormData.password}
                            onChange={handleCreateChange}
                            isLoading={isCreating}
                            required
                        />

                        {/* SUBMIT BUTONU - YENİ BUTTON BİLEŞENİ KULLANILDI */}
                        <Button
                            type="submit"
                            isLoading={isCreating}
                            variant="success"
                            icon={UserPlus}
                            className="w-full mt-6"
                        >
                            Çalışanı Kaydet
                        </Button>
                    </form>
                </Modal>
            )}
        </div>
    );
}