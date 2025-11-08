// src/pages/Login.tsx

import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { login } from '../authService'; // authService.ts dosyasından login fonksiyonunu import ediyoruz
import type { UserCredentials } from '../authService'; // UserCredentials tipini de import ediyoruz
 // UserCredentials tipini de import ediyoruz

const Login: React.FC = () => {
    // React Router Hook'u
    const navigate = useNavigate(); 
    
    // Form verileri için state
    const [credentials, setCredentials] = useState<UserCredentials>({
        username: '',
        password: '',
    });
    
    // Yüklenme ve hata yönetimi
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form alanları değiştiğinde state'i günceller
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    // Form gönderildiğinde çalışır
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // authService.ts'deki login fonksiyonunu çağır
        const result = await login(credentials);

        setLoading(false);

        if (result.success) {
            // Başarılı giriş: Token'lar localStorage'a kaydedildi.
            // Kullanıcıyı firma paneline yönlendir
            alert(`Hoş geldiniz, ${result.user}!`);
            navigate('/firm-panel'); // Projenizdeki ilgili panele yönlendirin

        } else {
            // Hatalı giriş: Kullanıcıya mesajı göster
            setError(result.error || 'Giriş bilgileri yanlış veya sunucu hatası.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Firma Girişi</h2>
                
                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="username">
                            Kullanıcı Adı (Email)
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="password">
                            Şifre
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;