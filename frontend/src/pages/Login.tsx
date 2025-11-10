// frontend/src/pages/Login.tsx

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, type UserCredentials } from '../authService';
import { LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<UserCredentials>({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      const result = await login(credentials);

      if (result.success) {
        // Oturum başarıyla kaydedildi, firma paneline yönlendir
        navigate('/firm-panel');
      } else {
        setError(result.error || 'Giriş başarısız oldu');
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu. Sunucunuz çalışıyor mu?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 flex justify-center items-center space-x-2">
                <LogIn className="w-7 h-7 text-blue-500" />
                <span>Firma Girişi</span>
            </h1>
            <p className="text-gray-500 mt-2">Gelen talepleri yönetmek için giriş yapın.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı (Email)
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                'Giriş Yapılıyor...'
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
        </form>
      </div>
    </div>
  );
}