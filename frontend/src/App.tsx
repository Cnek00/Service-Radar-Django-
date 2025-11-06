// frontend/src/App.tsx

import { useState, useEffect } from 'react';
import './App.css';
import { type IService } from './types/api'; // Tanımladığınız tipleri import ediyoruz
import { searchServices } from './apiClient'; // API fonksiyonumuzu import ediyoruz

function App() {
  // 1. Durum Yönetimi (State)
  // API'den gelen hizmet listesini tutacak state
  const [services, setServices] = useState<IService[]>([]);
  // Yüklenme durumunu tutacak state (UI'da spinner göstermek için)
  const [loading, setLoading] = useState(true);
  // Hata durumunu tutacak state
  const [error, setError] = useState<string | null>(null);

  // 2. Veri Çekme Etkisi (Effect)
  useEffect(() => {
    // API çağrısını yapacak asenkron fonksiyon
    const fetchServices = async () => {
      try {
        setLoading(true); // Yüklemeyi başlat
        setError(null); // Hataları sıfırla

        // Backend'deki tüm hizmetleri çekmek için boş sorgu gönderiyoruz.
        // Test için herhangi bir query veya location göndermiyoruz.
        const data = await searchServices("", ""); 
        
        // Gelen veriyi (IService dizisi) state'e set et
        setServices(data);
      } catch (err) {
        console.error("Hizmetler çekilirken hata oluştu:", err);
        // Hata mesajını yakalayıp state'e kaydet
        setError("Hizmet listesi yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false); // Yüklemeyi bitir
      }
    };

    fetchServices();
  }, []); // [] sayesinde, sadece bileşen ilk yüklendiğinde çalışır.

  // 3. Render (Ekrana Çizme) Mantığı
  
  return (
    <div className="App">
      <header style={{ padding: '20px', backgroundColor: '#333', color: 'white' }}>
        <h1>Service Radar</h1>
      </header>
      
      <main style={{ padding: '20px' }}>
        <h2>Hizmet Arama Sonuçları</h2>
        
        {loading && <p>Hizmetler yükleniyor...</p>}
        {error && <p style={{ color: 'red' }}>Hata: {error}</p>}

        {/* Veri geldiğinde listeleme */}
        {!loading && services.length > 0 && (
          <div className="service-list">
            <h3>Toplam {services.length} Hizmet Bulundu:</h3>
            {services.map(service => (
              <div key={service.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                <h4>{service.title}</h4>
                <p><strong>Firma:</strong> {service.company.name}</p>
                <p><strong>Fiyat Aralığı:</strong> {service.price_range_min} - {service.price_range_max}</p>
                <p><strong>Konum:</strong> {service.company.location_text}</p>
                <p>{service.description.substring(0, 100)}...</p>
                {/* İleride burada Talep Gönder butonu olacak */}
              </div>
            ))}
          </div>
        )}

        {/* Veri gelmediğinde (boş sonuç) */}
        {!loading && services.length === 0 && !error && (
          <p>Aradığınız kriterlere uygun hizmet bulunamadı.</p>
        )}
      </main>
    </div>
  );
}

export default App;