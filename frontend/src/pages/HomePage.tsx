// frontend/src/pages/HomePage.tsx (GÜNCELLENDİ: Hizmetler Izgara Düzeninde Gösteriliyor)

import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import { searchServices } from '../apiClient';
import ServiceCard from '../components/ServiceCard';
import ReferralForm from '../components/ReferralForm'; 
import Modal from '../components/Modal'; 
import { type IService } from '../types/api';

// onSuccess: App.tsx'den gelen ve başarılı mesajı gösteren fonksiyondur.
interface HomePageProps {
    onSuccess: (message: string) => void;
}

export default function HomePage({ onSuccess }: HomePageProps) {
    const [services, setServices] = useState<IService[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // MODAL STATE'LERİ
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Tıklanan hizmetin bilgilerini tutar
    const [selectedService, setSelectedService] = useState<IService | null>(null);

    // SearchBar'dan submit geldiğinde API çağrısını yapar ve sonuçları kaydeder
    const handleSearchResults = (results: IService[]) => {
        setServices(results);
        setHasSearched(true);
    };

    const handleSearchSubmit = async (query: string, location: string) => {
        const results = await searchServices(query, location);
        handleSearchResults(results);
    };

    // Card tıklandığında çalışır
    const handleCardClick = (service: IService) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
    };
    
    // Talep formu başarıyla gönderildiğinde çalışır
    const handleReferralSuccess = (message: string) => {
        onSuccess(message); // Ana bileşendeki (App.tsx'deki) onSuccess'i çağır
        handleCloseModal(); // Modalı kapat
    };

    return (
        <div className="pt-8">
            <div className="max-w-4xl mx-auto">
                {/* Arama Çubuğu */}
                <SearchBar onSearchSubmit={handleSearchSubmit} />

                <div className="mt-10">
                    {/* Başlangıç Mesajı */}
                    {!hasSearched && (
                        <div className="text-center py-12 bg-gray-100 rounded-xl shadow-inner">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Hizmetleri Keşfet</h2>
                            <p className="text-gray-600">Aradığınız hizmeti ve konumu girerek hemen arama yapın.</p>
                        </div>
                    )}

                    {/* Arama Sonuçları */}
                    {hasSearched && services.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                                {services.length} Sonuç Bulundu
                            </h2>
                            
                            {/* BURASI GÜNCELLENDİ: Grid (Izgara) Düzeni */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((service) => (
                                    <ServiceCard 
                                        key={service.id} 
                                        service={service}
                                        // Tıklama işlevi eklendi: Seçilen hizmeti state'e kaydeder ve modalı açar
                                        onClick={() => handleCardClick(service)}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Arama yapıldı ama sonuç yok */}
                    {hasSearched && services.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
                            <p className="text-gray-600 text-lg font-medium">
                                Arama kriterlerinize uygun hizmet bulunamadı. Lütfen farklı anahtar kelimeler veya konumlar deneyin.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* REFERRAL FORM MODALI */}
            {selectedService && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={`${selectedService.title} Hizmeti İçin Talep Oluştur`}
                >
                    <ReferralForm
                        service={selectedService}
                        onSuccess={handleReferralSuccess}
                    />
                </Modal>
            )}
        </div>
    );
}