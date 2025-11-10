// frontend/src/pages/HomePage.tsx (GÜNCELLENMİŞ)

import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import { searchServices } from '../apiClient';
import ServiceCard from '../components/ServiceCard';
import ReferralForm from '../components/ReferralForm'; // Talep formunu import ediyoruz
import Modal from '../components/Modal'; // YENİ: Modal bileşenini import ediyoruz
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

    // ServiceCard'a tıklandığında modalı açar
    const handleCardClick = (service: IService) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    // Modal kapatma fonksiyonu
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null); // Hafızayı temizliyoruz
    };

    // Talep başarıyla gönderildiğinde (ReferralForm'dan gelir)
    const handleReferralSuccess = (message: string) => {
        handleCloseModal(); // Modalı kapat
        onSuccess(message); // App.tsx'e başarı mesajını gönderir
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-12">

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Service Radar: Hizmetleri Keşfet
                    </h1>
                    <p className="text-lg text-gray-600">
                        İhtiyacınız olan hizmeti bulun ve firmalarla iletişime geçin
                    </p>
                </div>

                <SearchBar onSearchSubmit={handleSearchSubmit} />

                <div className="mt-12">
                    {/* Arama Sonuçları Listesi */}
                    {services.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Arama Sonuçları ({services.length})
                            </h2>
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
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">
                                Arama kriterlerinize uygun hizmet bulunamadı.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* REFERRAL FORM MODALI */}
            {/* Sadece bir hizmet seçilmişse ve modal açık olmalıysa gösterir */}
            {selectedService && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={`${selectedService.title} Hizmeti İçin Talep Oluştur`}
                >
                    {/* selectedService objesini ReferralForm'a iletiyoruz */}
                    <ReferralForm
                        service={selectedService}
                        onSuccess={handleReferralSuccess}
                    />
                </Modal>
            )}
        </div>
    );
}