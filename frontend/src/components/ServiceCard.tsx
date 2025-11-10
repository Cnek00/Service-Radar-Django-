// frontend/src/components/ServiceCard.tsx

import { useState } from 'react';
import { type IService } from '../types/api';
import { Building2, DollarSign, MapPin, MessageCircle } from 'lucide-react';
import ReferralForm from './ReferralForm';

interface ServiceCardProps {
    service: IService;
    onSuccess: (message: string) => void; 
}

export default function ServiceCard({ service, onSuccess }: ServiceCardProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Backend'den gelen veriye göre fiyat aralığını formatlama
    const priceRange = service.price_range_min === service.price_range_max 
        ? `${service.price_range_min} TL`
        : `${service.price_range_min} - ${service.price_range_max} TL`;

    // Backend'den gelen veriye göre şirket adı çekiliyor. (Bolt'un yarattığı karışıklığı temizler)
    const companyName = service.company.name;
    const locationText = service.company.location_text;

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200 flex flex-col">
            <div className="flex flex-col flex-grow">
                {/* Başlık ve Şirket Adı */}
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{service.title}</h3>
                    <Building2 className="w-6 h-6 text-blue-500 flex-shrink-0 ml-2" />
                </div>

                <div className="flex items-center space-x-2 mb-3">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-700 font-medium">
                        {companyName}
                    </p>
                </div>

                {/* Konum */}
                {locationText && (
                    <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-600 text-sm">{locationText}</p>
                    </div>
                )}

                {/* Açıklama */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {service.description}
                </p>
            </div>

            {/* Fiyat ve Aksiyon */}
            <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">
                        {priceRange}
                    </span>
                </div>
                
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="inline-flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                >
                    <MessageCircle className="w-4 h-4" />
                    <span>{isFormOpen ? 'Formu Kapat' : 'Talep Gönder'}</span>
                </button>
            </div>

            {isFormOpen && (
                <div className="mt-4 border-t pt-4">
                    <ReferralForm 
                        service={service} 
                        onSuccess={(message) => {
                            onSuccess(message);
                            setIsFormOpen(false); // Formu başarıyla gönderdikten sonra kapat
                        }} 
                    />
                </div>
            )}
        </div>
    );
}