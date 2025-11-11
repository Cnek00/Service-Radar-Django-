import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Building2 } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface RegisterResponse {
    success: boolean;
    id?: string;
    firm_id?: string;
    user_id?: string;
    detail?: string;
}

export default function Register() {
    const navigate = useNavigate();
    const [registerType, setRegisterType] = useState<'customer' | 'firm'>('customer');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        password: '',
        confirm_password: '',
        firm_name: '',
        location: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.username || !formData.email || !formData.full_name || !formData.password) {
            setError('Lütfen tüm zorunlu alanları doldurun');
            return false;
        }

        if (formData.password !== formData.confirm_password) {
            setError('Şifreler eşleşmiyor');
            return false;
        }

        if (formData.password.length < 8) {
            setError('Şifre en az 8 karakter olmalıdır');
            return false;
        }

        if (registerType === 'firm' && !formData.firm_name) {
            setError('Firma adı zorunludur');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setError('');
        setIsLoading(true);

        try {
            let endpoint = `${API_BASE_URL}/api/core/users/register`;
            let payload: any = {
                username: formData.username,
                email: formData.email,
                full_name: formData.full_name,
                password: formData.password,
                is_firm: false,
            };

            if (registerType === 'firm') {
                endpoint = `${API_BASE_URL}/api/core/firm/register`;
                payload = {
                    username: formData.username,
                    email: formData.email,
                    full_name: formData.full_name,
                    password: formData.password,
                    firm_name: formData.firm_name,
                    location: formData.location,
                    tax_number: '',
                    legal_address: '',
                    phone_number: '',
                    working_hours: '',
                    iban: '',
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Kayıt başarısız');
            }

            const data: RegisterResponse = await response.json();

            if (!data.success) {
                throw new Error(data.detail || 'Kayıt başarısız');
            }

            // Redirect to login
            navigate('/login', {
                state: { message: 'Kayıt başarılı! Lütfen giriş yapın.' }
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-300">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Kayıt Ol
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Hesap oluşturmaya başlayın
                        </p>
                    </div>

                    {/* Register Type Selection */}
                    <div className="flex gap-3 mb-8">
                        <button
                            type="button"
                            onClick={() => setRegisterType('customer')}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${registerType === 'customer'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <User className="w-4 h-4 inline mr-2" />
                            Müşteri
                        </button>
                        <button
                            type="button"
                            onClick={() => setRegisterType('firm')}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${registerType === 'firm'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Building2 className="w-4 h-4 inline mr-2" />
                            Firma
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Kullanıcı Adı *
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Kullanıcı adı"
                                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                E-posta *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="E-posta adresiniz"
                                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Adınız Soyadınız *
                            </label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Adınız soyadınız"
                                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                required
                            />
                        </div>

                        {registerType === 'firm' && (
                            <>
                                <div>
                                    <label htmlFor="firm_name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Firma Adı *
                                    </label>
                                    <input
                                        type="text"
                                        id="firm_name"
                                        name="firm_name"
                                        value={formData.firm_name}
                                        onChange={handleChange}
                                        placeholder="Firma adı"
                                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Konum
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Şehir / Bölge"
                                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Şifre *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Şifre"
                                    className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Şifreyi Onayla *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirm_password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    placeholder="Şifreyi tekrar girin"
                                    className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl mt-6"
                        >
                            <span>{isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}</span>
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400">
                            Zaten hesabınız var mı?{' '}
                            <a
                                href="/login"
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                Giriş Yapın
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
