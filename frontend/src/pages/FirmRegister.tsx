// frontend/src/pages/FirmRegister.tsx

import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, FileText, MapPin, Clock, DollarSign, Loader2, Key } from 'lucide-react';
import { registerFirmAndUser } from '../apiClient'; 
import { type IFirmRegisterIn } from '../types/api'; 

// Formun başlangıç state'i
const initialFirmData: IFirmRegisterIn = {
    // Kurumsal Bilgiler (User)
    username: '',
    email: '',
    full_name: '',
    password: '',
    
    // Firma Bilgileri (Company/Firm)
    firm_name: '',
    tax_number: '',
    legal_address: '',
    phone_number: '',
    location: '', 
    working_hours: '', 
    iban: '', 
};

// Basit Tailwind stili için yardımcı değişken
const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all";


export default function FirmRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<IFirmRegisterIn>(initialFirmData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await registerFirmAndUser(formData); 

            if (result.success) {
                setSuccess('Tebrikler! Firma kaydınız başarıyla alındı. Giriş sayfasına yönlendiriliyorsunuz.');
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } else {
                setError(result.error || 'Firma kaydı başarısız oldu');
            }
        } catch (err) {
            setError('Beklenmeyen bir hata oluştu: Sunucuya ulaşılamıyor.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <div className="flex flex-col items-center mb-8 border-b pb-4">
                    <Building2 className="w-12 h-12 text-purple-600 mb-3" />
                    <h2 className="text-3xl font-bold text-gray-900">İşletme Kayıt Formu</h2>
                    <p className="mt-2 text-md text-gray-600">Lütfen tüm kurumsal ve operasyonel bilgileri eksiksiz giriniz.</p>
                </div>
                
                {error && <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
                {success && <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}


                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* BÖLÜM 1: FİRMA YÖNETİCİSİ HESAP BİLGİLERİ */}
                    <div className="border p-6 rounded-lg bg-indigo-50/50">
                        <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                            <Key className="w-5 h-5 mr-2" /> 1. Yönetici Hesap Bilgileri
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" name="full_name" placeholder="Yönetici Adı Soyadı" value={formData.full_name} onChange={handleChange} required className={inputClass} />
                            <input type="text" name="username" placeholder="Yönetici Kullanıcı Adı" value={formData.username} onChange={handleChange} required className={inputClass} />
                            <input type="email" name="email" placeholder="Yönetici E-posta" value={formData.email} onChange={handleChange} required className={inputClass} />
                            <input type="password" name="password" placeholder="Şifre" value={formData.password} onChange={handleChange} required className={inputClass} />
                        </div>
                    </div>

                    {/* BÖLÜM 2: YASAL VE KURUMSAL BİLGİLER */}
                    <div className="border p-6 rounded-lg bg-white">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2" /> 2. Yasal ve Kurumsal Kimlik
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" name="firm_name" placeholder="Firma Ticari Adı" value={formData.firm_name} onChange={handleChange} required className={inputClass} />
                            <input type="text" name="tax_number" placeholder="Vergi Numarası" value={formData.tax_number} onChange={handleChange} required className={inputClass} />
                            <input type="text" name="phone_number" placeholder="Aktif Telefon Numarası" value={formData.phone_number} onChange={handleChange} required className={inputClass} />
                            <input type="text" name="legal_address" placeholder="Yasal Fatura Adresi" value={formData.legal_address} onChange={handleChange} required className={`${inputClass} col-span-2`} />
                        </div>
                    </div>
                    
                    {/* BÖLÜM 3: OPERASYONEL BİLGİLER */}
                    <div className="border p-6 rounded-lg bg-white">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2" /> 3. Operasyonel Bilgiler
                        </h3>
                        <input type="text" name="location" placeholder="İşletme Konumu (Adres)" value={formData.location} onChange={handleChange} required className={`${inputClass} mb-4`} />
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <input type="text" name="working_hours" placeholder="Çalışma Saatleri (Örn: Hafta İçi 09:00 - 18:00)" value={formData.working_hours} onChange={handleChange} required className={inputClass} />
                        </div>
                    </div>
                    
                    {/* BÖLÜM 4: FİNANSAL BİLGİLER */}
                    <div className="border p-6 rounded-lg bg-white">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" /> 4. Finansal Entegrasyon
                        </h3>
                        <input type="text" name="iban" placeholder="Banka Hesap IBAN Numarası" value={formData.iban} onChange={handleChange} required className={inputClass} />
                        <p className="text-xs text-gray-500 mt-2">Bu hesaba platform hak edişleriniz yatırılacaktır.</p>
                    </div>


                    {/* Submit Butonu */}
                    <button
                        type="submit"
                        disabled={isLoading || !!success}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                        {isLoading ? 'Kayıt Gönderiliyor...' : 'Firma Kaydını Tamamla'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Zaten kayıtlı bir firma yöneticisi misiniz?{' '}
                    <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </div>
    );
}