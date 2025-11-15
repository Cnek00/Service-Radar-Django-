// frontend/src/pages/FirmRegister.tsx (GÜNCELLENDİ)

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Building2, FileText, MapPin, Clock, DollarSign, Key, Mail, User, Phone, CheckSquare
} from 'lucide-react';
import { registerFirmAndUser } from '../apiClient'; 
import { type IFirmRegisterIn } from '../types/api'; 

// YENİ BİLEŞENLERİ İMPORT ET
import Button from '../components/Button'; 
import Input from '../components/Input'; 

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
                setSuccess('Firma kaydınız başarıyla tamamlandı! Giriş sayfasına yönlendiriliyorsunuz...');
                // 3 saniye sonra login sayfasına yönlendir
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                // Backend'den gelen detaylı hata mesajını kullan
                setError(result.error || 'Firma kaydı başarısız oldu.'); 
            }
        } catch (err) {
            setError('Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 py-10">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8 flex items-center justify-center space-x-2 text-purple-600">
                    <Building2 className="w-8 h-8" />
                    <span>Firma Kayıt Formu</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Hata ve Başarı Mesajları */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            {success}
                        </div>
                    )}

                    {/* ======================================================= */}
                    {/* BÖLÜM 1: YÖNETİCİ HESAP BİLGİLERİ */}
                    {/* ======================================================= */}
                    <div className="border border-gray-200 p-6 rounded-lg space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center text-purple-600">
                            <User className="w-5 h-5 mr-2" /> 1. Yönetici Hesap Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                icon={User}
                                type="text"
                                name="full_name"
                                placeholder="Ad Soyad"
                                value={formData.full_name}
                                onChange={handleChange}
                                isLoading={isLoading}
                                required
                            />
                            <Input
                                icon={Mail}
                                type="email"
                                name="email"
                                placeholder="E-posta Adresi"
                                value={formData.email}
                                onChange={handleChange}
                                isLoading={isLoading}
                                required
                            />
                            <Input
                                icon={User}
                                type="text"
                                name="username"
                                placeholder="Kullanıcı Adı"
                                value={formData.username}
                                onChange={handleChange}
                                isLoading={isLoading}
                                required
                                helperText="Giriş için kullanılacak benzersiz ad."
                            />
                            <Input
                                icon={Key}
                                type="password"
                                name="password"
                                placeholder="Şifre"
                                value={formData.password}
                                onChange={handleChange}
                                isLoading={isLoading}
                                required
                                helperText="En az 8 karakter olmalıdır."
                            />
                        </div>
                    </div>

                    {/* ======================================================= */}
                    {/* BÖLÜM 2: KURUMSAL BİLGİLER */}
                    {/* ======================================================= */}
                    <div className="border border-gray-200 p-6 rounded-lg space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center text-purple-600">
                            <Building2 className="w-5 h-5 mr-2" /> 2. Kurumsal Bilgiler
                        </h3>
                        <Input
                            icon={Building2}
                            type="text"
                            name="firm_name"
                            placeholder="Firma Adı (Örn: XYZ Ltd. Şti.)"
                            value={formData.firm_name}
                            onChange={handleChange}
                            isLoading={isLoading}
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                icon={FileText}
                                type="text"
                                name="tax_number"
                                placeholder="Vergi Numarası"
                                value={formData.tax_number}
                                onChange={handleChange}
                                isLoading={isLoading}
                                required
                            />
                            <Input
                                icon={Phone}
                                type="tel"
                                name="phone_number"
                                placeholder="Telefon Numarası"
                                value={formData.phone_number}
                                onChange={handleChange}
                                isLoading={isLoading}
                                required
                            />
                        </div>
                        <Input
                            as="textarea"
                            name="legal_address"
                            placeholder="Yasal Şirket Adresi (Detaylı)"
                            value={formData.legal_address}
                            onChange={handleChange}
                            isLoading={isLoading}
                            required
                            rows={3}
                        />
                    </div>

                    {/* ======================================================= */}
                    {/* BÖLÜM 3: OPERASYON BİLGİLERİ */}
                    {/* ======================================================= */}
                    <div className="border border-gray-200 p-6 rounded-lg space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center text-purple-600">
                            <MapPin className="w-5 h-5 mr-2" /> 3. Operasyon Bilgileri
                        </h3>
                        <Input
                            icon={MapPin}
                            type="text"
                            name="location"
                            placeholder="Hizmet Verdiğiniz Konum (Örn: İstanbul, Ankara, Türkiye Geneli)"
                            value={formData.location}
                            onChange={handleChange}
                            isLoading={isLoading}
                            required
                        />
                        <Input
                            icon={Clock}
                            type="text"
                            name="working_hours"
                            placeholder="Çalışma Saatleri (Örn: Pzt-Cuma 09:00-18:00)"
                            value={formData.working_hours}
                            onChange={handleChange}
                            isLoading={isLoading}
                            required
                        />
                    </div>
                    
                    {/* ======================================================= */}
                    {/* BÖLÜM 4: FİNANSAL ENTEGRASYON */}
                    {/* ======================================================= */}
                    <div className="border border-gray-200 p-6 rounded-lg space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center text-purple-600">
                            <DollarSign className="w-5 h-5 mr-2" /> 4. Finansal Entegrasyon
                        </h3>
                        <Input
                            icon={DollarSign}
                            type="text"
                            name="iban"
                            placeholder="Banka Hesap IBAN Numarası"
                            value={formData.iban}
                            onChange={handleChange}
                            isLoading={isLoading}
                            required
                            helperText="Bu hesaba platform hak edişleriniz yatırılacaktır."
                        />
                    </div>


                    {/* YENİ BUTTON KULLANIMI */}
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        variant="primary" // Artık mor tonları default olarak 'primary' olarak kabul edebiliriz
                        icon={CheckSquare}
                        className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white" 
                        disabled={!!success}
                    >
                        {isLoading ? 'Kayıt Gönderiliyor...' : 'Firma Kaydını Tamamla'}
                    </Button>
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