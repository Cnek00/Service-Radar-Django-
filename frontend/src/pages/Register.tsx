// frontend/src/pages/Register.tsx

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { registerCustomer } from '../apiClient'; 
import { type IRegisterIn } from '../types/api'; 

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
                setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(result.error || 'Kayıt başarısız oldu');
            }
        } catch (err) {
            setError('Beklenmeyen bir hata oluştu: Sunucuya ulaşılamıyor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <UserPlus className="w-12 h-12 text-blue-600 mb-3" />
                    <h2 className="text-3xl font-bold text-gray-900">Müşteri Kayıt</h2>
                    <p className="mt-2 text-sm text-gray-600">Hizmet talebi göndermek için hemen üye ol!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Adınız Soyadınız</label>
                        <input type="text" id="full_name" name="full_name" value={credentials.full_name} onChange={handleChange} disabled={isLoading} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"/>
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
                        <input type="text" id="username" name="username" value={credentials.username} onChange={handleChange} disabled={isLoading} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                        <input type="email" id="email" name="email" value={credentials.email} onChange={handleChange} disabled={isLoading} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                        <input type="password" id="password" name="password" value={credentials.password} onChange={handleChange} disabled={isLoading} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"/>
                    </div>

                    {error && (<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>)}
                    {success && (<div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>)}

                    <button
                        type="submit"
                        disabled={isLoading || !!success}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                        {isLoading ? 'Kayıt Olunuyor...' : 'Hemen Kayıt Ol'}
                    </button>
                </form>

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