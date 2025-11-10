// frontend/src/pages/HomePage.tsx

import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ServiceCard from '../components/ServiceCard';
import { type IService } from '../types/api';
import { searchServices } from '../apiClient';

interface HomePageProps {
    onSuccess: (message: string) => void;
}

export default function HomePage({ onSuccess }: HomePageProps) {
    const [services, setServices] = useState<IService[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false); // İlk yüklemeyi kontrol etmek için

    // Sayfa ilk yüklendiğinde tüm hizmetleri çek
    useEffect(() => {
        if (!hasSearched) {
            handleSearch("", ""); // Boş sorgu ile tüm hizmetleri çeker
            setHasSearched(true);
        }
    }, [hasSearched]);

    // SearchBar'dan gelen verilerle arama yapan ana fonksiyon
    const handleSearch = async (query: string, location: string) => {
        setLoading(true);
        setError(null);
        setServices([]);

        try {
            const data = await searchServices(query, location);
            setServices(data);
        } catch (err: any) {
            // Backend hata verirse (örn: 500)
            setError("Hizmetler aranırken bir sorun oluştu: " + err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Aradığınız Hizmetler
                    </h1>
                    <p className="text-lg text-gray-600">
                        Konum ve anahtar kelimeye göre arama yapın
                    </p>
                </div>
                
                {/* SearchBar bileşeni, arama verilerini handleSearch fonksiyonuna iletir */}
                <SearchBar onSearchSubmit={handleSearch} /> 

                <div className="mt-12">
                    {loading && <div className="text-center py-12 text-blue-600">Hizmetler aranıyor...</div>}
                    
                    {error && (
                        <div className="text-center py-12 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}
                    
                    {!loading && services.length === 0 && hasSearched && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">
                                Arama kriterlerinize uygun hizmet bulunamadı.
                            </p>
                        </div>
                    )}

                    {services.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Sonuçlar ({services.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((service) => (
                                    <ServiceCard 
                                        key={service.id} 
                                        service={service} 
                                        onSuccess={onSuccess} // ServiceCard'a prop iletiyoruz
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}