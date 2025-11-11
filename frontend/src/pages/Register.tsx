// frontend/src/pages/Register.tsx (GÜNCELLENDİ)

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, User, Key } from 'lucide-react'; 
import { registerCustomer } from '../apiClient'; 
import { type IRegisterIn } from '../types/api'; 

// YENİ BİLEŞENLERİ İMPORT ET
import Button from '../components/Button'; 
import Input from '../components/Input'; 

// Müşteri kayıt formu için başlangıç state'i
const initialCredentials: IRegisterIn = {
    username: '',
    email: '',
    full_name: '',
    password: '',
    is_firm: false, // Müşteri olduğu için false
};

export default function Register() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState<IRegisterIn>(initialCredentials);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await registerCustomer(credentials); 

            if (result.success) {
                setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
                // 3 saniye sonra login sayfasına yönlendir
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                // Backend'den gelen detaylı hata mesajını kullan
                setError(result.error || 'Kayıt başarısız oldu'); 
            }
        } catch (err) {
            setError('Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-6 flex items-center justify-center space-x-2">
                    <UserPlus className="w-7 h-7 text-blue-600" />
                    <span>Müşteri Kayıt</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
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
                    
                    {/* KULLANICI ADI */}
                    <Input
                        icon={User}
                        type="text"
                        name="username"
                        placeholder="Kullanıcı Adı"
                        value={credentials.username}
                        onChange={handleChange}
                        isLoading={isLoading}
                        required
                        helperText="Sisteme giriş yaparken kullanacağınız benzersiz ad."
                    />

                    {/* E-POSTA */}
                    <Input
                        icon={Mail}
                        type="email"
                        name="email"
                        placeholder="E-posta Adresi"
                        value={credentials.email}
                        onChange={handleChange}
                        isLoading={isLoading}
                        required
                    />
                    
                    {/* AD SOYAD */}
                    <Input
                        icon={User}
                        type="text"
                        name="full_name"
                        placeholder="Ad Soyad"
                        value={credentials.full_name}
                        onChange={handleChange}
                        isLoading={isLoading}
                        required
                    />

                    {/* ŞİFRE */}
                    <Input
                        icon={Key}
                        type="password"
                        name="password"
                        placeholder="Şifre"
                        value={credentials.password}
                        onChange={handleChange}
                        isLoading={isLoading}
                        required
                        helperText="En az 8 karakter olmalıdır."
                    />

                    {/* YENİ BUTTON KULLANIMI */}
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        variant="primary"
                        icon={UserPlus}
                        className="w-full mt-6"
                        disabled={!!success}
                    >
                        Hemen Kayıt Ol
                    </Button>
                </form>

                {/* Giriş Linki */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Zaten bir hesabınız var mı?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </div>
    );
}