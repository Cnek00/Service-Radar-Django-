// frontend/src/pages/Login.tsx

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Link import edildi
import { login, type UserCredentials } from '../authService';
import { LogIn, Loader2 } from 'lucide-react'; // Loader2 import edildi

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<UserCredentials>({
    username: '', // username olarak düzeltildi
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
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <LogIn className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Giriş Yap</h2>
            <p className="text-gray-600 mt-2">Firma panelinize veya müşteri hesabınıza erişin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
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
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </form>

          {/* YENİ: Kayıt Linkleri */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-2">
              <p className="text-sm text-gray-600">
                  Hesabınız yok mu?{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                      Müşteri olarak kayıt olun
                  </Link>
              </p>
              <p className="text-xs text-gray-500">
                  İşletmenizi kaydetmek için: {' '}
                  <Link to="/firm-register" className="font-medium text-purple-600 hover:text-purple-500">
                      Firma Kayıt Formu
                  </Link>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}