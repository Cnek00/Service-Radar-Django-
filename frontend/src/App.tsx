// frontend/src/App.tsx

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// API ve Tipler
import { type IService } from './types/api';
import { searchServices } from './apiClient';

// Sayfalar ve Bileşenler
import ReferralForm from './components/ReferralForm';
import Login from './pages/Login'; // Giriş Sayfası
import FirmPanel from './pages/FirmPanel'; // Firma Paneli Sayfası

// Yetkilendirme Servisi
import { isAuthenticated } from './authService';

// ------------------------------------------------------------------
// 1. KORUMALI ROTA BİLEŞENİ
// ------------------------------------------------------------------

// Sadece giriş yapmış kullanıcıların görmesi gereken rotalar için koruyucu bileşen
const ProtectedRoute: React.FC<{ element: React.FC }> = ({ element: Component }) => {
  // Eğer kullanıcı giriş yapmadıysa (token yoksa), login sayfasına yönlendir
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  // Giriş yaptıysa, istenen bileşeni göster
  return <Component />;
};

// ------------------------------------------------------------------
// 2. ANA UYGULAMA BİLEŞENİ (APP)
// ------------------------------------------------------------------

// NOT: Müşteri arama ve listeleme mantığınızı Home bileşeni içine taşıyıp, 
// App bileşenini sadece Router olarak kullanmak daha iyi bir tasarım olurdu. 
// Ancak mevcut yapınızı korumak için, arama mantığını bir iç bileşene taşıyıp Router'ı dışarıda bırakıyorum.

const HomeContent: React.FC<{ handleSuccess: (message: string) => void }> = ({ handleSuccess }) => {
    const [services, setServices] = useState<IService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await searchServices("", ""); 
                setServices(data);
            } catch (err) {
                setError("Hizmet listesi yüklenirken bir sorun oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    return (
        <main style={{ padding: '20px' }}>
            <h2>Hizmet Arama Sonuçları</h2>
            
            {loading && <p>Hizmetler yükleniyor...</p>}
            {error && <p style={{ color: 'red' }}>Hata: {error}</p>}

            {!loading && services.length > 0 && (
                <div className="service-list">
                    <h3>Toplam {services.length} Hizmet Bulundu:</h3>
                    {services.map(service => (
                        <div key={service.id} style={{ border: '1px solid #ccc', margin: '20px 0', padding: '15px' }}>
                            <h4>{service.title} - ({service.company.name})</h4>
                            <p><strong>Fiyat Aralığı:</strong> {service.price_range_min} - {service.price_range_max}</p>
                            <p><strong>Konum:</strong> {service.company.location_text}</p>
                            <p>{service.description.substring(0, 100)}...</p>
                            
                            {/* Referral Formu */}
                            <ReferralForm service={service} onSuccess={handleSuccess} />
                            
                        </div>
                    ))}
                </div>
            )}

            {!loading && services.length === 0 && !error && (
                <p>Aradığınız kriterlere uygun hizmet bulunamadı.</p>
            )}
        </main>
    );
}

function App() {
    // Global başarı mesajı yönetimi
    const [successMessage, setSuccessMessage] = useState<string | null>(null); 

    // Formdan gelen başarı mesajını yöneten fonksiyon
    const handleSuccess = (message: string) => {
        setSuccessMessage(message);
        // Mesajı 5 saniye sonra temizle
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <Router>
            <div className="App">
                <header style={{ padding: '20px', backgroundColor: '#333', color: 'white' }}>
                    <h1>Service Radar</h1>
                    {/* Basit Navigasyon */}
                    <nav>
                        <a href="/" style={{ color: 'white', marginRight: '15px' }}>Anasayfa</a>
                        <a href="/firm-panel" style={{ color: 'white' }}>Firma Paneli</a>
                    </nav>
                </header>
                
                {/* Başarı mesajını global olarak göster */}
                {successMessage && (
                    <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', textAlign: 'center' }}>
                        {successMessage}
                    </div>
                )}
                
                <Routes>
                    {/* Ana Sayfa Rotası (Müşteri Hizmet Listesi) */}
                    <Route path="/" element={<HomeContent handleSuccess={handleSuccess} />} />
                    
                    {/* Giriş Rotası: Herkes erişebilir */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Korumalı Firma Paneli Rotası */}
                    <Route path="/firm-panel" element={<ProtectedRoute element={FirmPanel} />} />

                    {/* Tanımlanmamış tüm rotaları Anasayfaya yönlendir */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

            </div>
        </Router>
    );
}

export default App;