// frontend/src/App.tsx

import { useState, useEffect } from 'react';
import './App.css';
import { type IService } from './types/api';
import { searchServices } from './apiClient';
import ReferralForm from './components/ReferralForm'; // Yeni formu import ediyoruz

function App() {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Kullanıcıya başarı mesajı göstermek için yeni state
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        // Backend'deki tüm hizmetleri çekmek için boş sorgu gönderiyoruz.
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

  // Formdan gelen başarı mesajını yöneten fonksiyon
  const handleSuccess = (message: string) => {
      setSuccessMessage(message);
      // Mesajı 5 saniye sonra temizle
      setTimeout(() => setSuccessMessage(null), 5000);
  };
  
  return (
    <div className="App">
      <header style={{ padding: '20px', backgroundColor: '#333', color: 'white' }}>
        <h1>Service Radar</h1>
      </header>
      
      <main style={{ padding: '20px' }}>
        <h2>Hizmet Arama Sonuçları</h2>
        
        {loading && <p>Hizmetler yükleniyor...</p>}
        {error && <p style={{ color: 'red' }}>Hata: {error}</p>}
        {/* Başarı mesajını göster */}
        {successMessage && <p style={{ color: 'green', fontWeight: 'bold' }}>{successMessage}</p>}

        {!loading && services.length > 0 && (
          <div className="service-list">
            <h3>Toplam {services.length} Hizmet Bulundu:</h3>
            {services.map(service => (
              <div key={service.id} style={{ border: '1px solid #ccc', margin: '20px 0', padding: '15px' }}>
                <h4>{service.title} - ({service.company.name})</h4>
                <p><strong>Fiyat Aralığı:</strong> {service.price_range_min} - {service.price_range_max}</p>
                <p><strong>Konum:</strong> {service.company.location_text}</p>
                <p>{service.description.substring(0, 100)}...</p>
                
                {/* YENİ EK: Referral Formu */}
                <ReferralForm service={service} onSuccess={handleSuccess} />
                
              </div>
            ))}
          </div>
        )}

        {!loading && services.length === 0 && !error && (
          <p>Aradığınız kriterlere uygun hizmet bulunamadı.</p>
        )}
      </main>
    </div>
  );
}

export default App;