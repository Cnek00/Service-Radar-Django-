// frontend/src/pages/FirmServiceList.tsx (GÜNCELLENMİŞ: CRUD İşlevleri Eklendi)

import { useState, useEffect, useCallback } from 'react';
import { type IService } from '../types/api';
// Yeni API fonksiyonlarını import ediyoruz
import { fetchFirmServices, deleteFirmService } from '../apiClient'; 
import { Package, Loader2, PlusCircle, Trash2, Edit, CheckCircle } from 'lucide-react';

import ServiceCard from '../components/ServiceCard'; 
import Button from '../components/Button'; 
import Modal from '../components/Modal'; // Modal bileşeni import edildi
import ServiceForm from '../components/ServiceForm'; // Yeni form bileşeni import edildi


export default function FirmServiceList() {
    const [services, setServices] = useState<IService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // MODAL STATE'LERİ
    const [isModalOpen, setIsModalOpen] = useState(false); // Ekleme/Düzenleme modalı
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Silme onay modalı
    // Düzenlenecek/Silinecek hizmeti tutar. Null ise Yeni Ekleme modudur.
    const [selectedService, setSelectedService] = useState<IService | null>(null);
    
    // Başarı mesajını kullanıcının görmesi için
    const [successMessage, setSuccessMessage] = useState(''); 


    // Hizmet listesini API'den çekme fonksiyonu
    const loadServices = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await fetchFirmServices(); 
            // En yeni hizmetleri üste çıkarmak için ID'ye göre ters sıralama
            const sortedData = data.sort((a, b) => b.id - a.id); 
            setServices(sortedData);
            setError('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Hizmetler yüklenemedi.';
            setError(`Yükleme başarısız: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadServices();
    }, [loadServices]);
    
    // Başarılı bir form işlemi sonrası (Ekleme/Düzenleme)
    const handleFormSuccess = (message: string) => {
        setSuccessMessage(message);
        loadServices(); // Listeyi yenile
        setTimeout(() => setSuccessMessage(''), 5000); // 5 saniye sonra mesajı kaldır
        setIsModalOpen(false); // Form modalını kapat
        setSelectedService(null); // Seçili hizmeti temizle
    };

    // YENİ EKLE BUTONUNA TIKLAMA
    const handleOpenCreateModal = () => {
        setSelectedService(null); // Yeni hizmet oluşturma modu
        setIsModalOpen(true);
    };
    
    // DÜZENLEME BUTONUNA TIKLAMA
    const handleEditClick = (service: IService) => {
        setSelectedService(service); // Düzenlenecek hizmeti kaydet
        setIsModalOpen(true);
    };
    
    // SİLME İŞLEMİNİ BAŞLATMA
    const handleDeleteClick = (service: IService) => {
        setSelectedService(service);
        setIsConfirmModalOpen(true);
    };
    
    // SİLME İŞLEMİNİ ONAYLAMA
    const handleConfirmDelete = async () => {
        if (!selectedService) return;

        try {
            setIsLoading(true); // Tüm sayfa yükleniyor durumuna geç
            await deleteFirmService(selectedService.id);
            handleFormSuccess(`'${selectedService.title}' hizmeti başarıyla silindi.`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false);
            setSelectedService(null);
        }
    };
    
    // Modal kapatma fonksiyonu
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsConfirmModalOpen(false);
        // Modal kapandıktan sonra formu resetlemek için null'a çekiyoruz.
        setSelectedService(null); 
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <Package className="w-6 h-6 mr-2 text-blue-600" />
                    Hizmet Yönetimi
                </h2>
                <Button 
                    variant="primary" 
                    icon={PlusCircle} 
                    onClick={handleOpenCreateModal}
                    disabled={isLoading}
                >
                    Yeni Hizmet Ekle
                </Button>
            </div>
            
            {/* Başarı Mesajı (Ekleme/Düzenleme/Silme sonrası) */}
            {successMessage && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm flex items-center" role="alert">
                    <CheckCircle className="w-4 h-4 mr-2" /> {successMessage}
                </div>
            )}
            
            {/* Hata Mesajı */}
            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
                    {error}
                </div>
            )}

            {/* Yükleme Durumu */}
            {isLoading && !isModalOpen ? (
                <div className="text-center py-10 text-gray-500 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Hizmetler Yükleniyor...
                </div>
            ) : services.length === 0 ? (
                // Sonuç yoksa
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600 text-lg font-medium">
                        Firmanızın henüz kayıtlı bir hizmeti bulunmamaktadır.
                    </p>
                    <p className='text-sm text-gray-500 mt-2'>Yukarıdaki butonu kullanarak ilk hizmetinizi ekleyin.</p>
                </div>
            ) : (
                // Hizmet Kartları ve Yönetim Butonları
                <div className="space-y-6">
                    {services.map((service) => (
                        <div 
                            key={service.id} 
                            // ServiceCard'ı bir sarmalayıcı içine alıp yönetim butonlarını ekliyoruz.
                            className="relative group border border-gray-200 rounded-xl overflow-hidden shadow-md transition-shadow hover:shadow-lg"
                        >
                            <ServiceCard 
                                service={service} 
                                // Yönetim panelinde kart tıklamasını pasif bırakıyoruz
                                onClick={() => {}} 
                                className="!cursor-default"
                            />
                            
                            {/* Yönetim Butonları Katmanı */}
                            <div className="absolute top-0 right-0 p-3 flex space-x-2">
                                <Button 
                                    variant="secondary" 
                                    icon={Edit} 
                                    onClick={() => handleEditClick(service)}
                                    // Buton stili
                                    className="bg-white text-blue-600 hover:bg-blue-100 border-blue-600 border"
                                >
                                    Düzenle
                                </Button>
                                <Button 
                                    variant="danger" 
                                    icon={Trash2} 
                                    onClick={() => handleDeleteClick(service)}
                                    // Buton stili
                                    className="bg-white text-red-600 hover:bg-red-100 border-red-600 border"
                                >
                                    Sil
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* HİZMET EKLEME / DÜZENLEME MODALI */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedService ? `"${selectedService.title}" Hizmetini Düzenle` : 'Yeni Hizmet Oluştur'}
            >
                <ServiceForm 
                    serviceToEdit={selectedService}
                    onSuccess={handleFormSuccess}
                    onClose={handleCloseModal}
                />
            </Modal>
            
            {/* HİZMET SİLME ONAY MODALI */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={handleCloseModal}
                title="Hizmet Silme Onayı"
            >
                {selectedService && (
                    <>
                        <p className="text-gray-700 mb-4">
                            **"{selectedService.title}"** hizmetini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button 
                                variant="secondary" 
                                onClick={handleCloseModal}
                                disabled={isLoading}
                            >
                                İptal
                            </Button>
                            <Button 
                                variant="danger" 
                                icon={Trash2} 
                                onClick={handleConfirmDelete}
                                disabled={isLoading}
                            >
                                Silmeyi Onayla
                            </Button>
                        </div>
                    </>
                )}
            </Modal>

        </div>
    );
}