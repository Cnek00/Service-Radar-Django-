// frontend/src/pages/Login.tsx (GÜNCELLENDİ)

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, type UserCredentials } from '../authService';
import { LogIn } from 'lucide-react'; // Loader2 artık Button bileşeninde

// YENİ: Yeni oluşturulan Button bileşenini import ediyoruz
import Button from '../components/Button'; 

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
        // Oturum başarıyla kaydedildi, firma paneline yönlendir (veya anasayfaya)
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

  // Input stili her yerde tekrar ettiği için onu da kaldırıp temiz bir form yapısı oluşturabiliriz.
  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Kullanıcı Girişi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kullanıcı Adı / E-posta
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              disabled={isLoading}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Şifre
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              className={inputClass}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* YENİ BUTTON KULLANIMI */}
          <Button
            type="submit" // HTML submit özelliğini kullanmak için type="submit"
            isLoading={isLoading}
            icon={LogIn}
            className="w-full" // Genişliği tam kaplaması için
          >
            Giriş Yap
          </Button>
        </form>

        {/* Kayıt Linkleri */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-2">
            <p className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Müşteri olarak kayıt olun
                </Link>
            </p>
            <p className="text-xs text-gray-500">
                İşletmenizi kaydetmek için:{' '}
                <Link to="/firm-register" className="font-medium text-purple-600 hover:text-purple-500">
                    Firma Kayıt Sayfası
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}