// frontend/src/components/ServiceCard.tsx (GÜNCELLENMİŞ)

import { type IService } from '../types/api';
import { Building2, DollarSign, MapPin, MousePointerClick } from 'lucide-react'; // MousePointerClick eklendi

interface ServiceCardProps {
    service: IService;
    // YENİ PROP: Kart tıklandığında modalı açmak için kullanılacak
    onClick: () => void; 
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
    return (
        // onClick prop'u eklendi ve tıklanabilirliği artırmak için stiller güncellendi
        <div 
            className="bg-white rounded-lg shadow-md hover:shadow-xl hover:ring-2 hover:ring-blue-500 transition-all duration-300 p-6 border border-gray-200 cursor-pointer"
            onClick={onClick} // Tıklama olayını HomePage'e iletiyoruz
        >
            <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{service.title}</h3>
                    <Building2 className="w-6 h-6 text-blue-500 flex-shrink-0 ml-2" />
                </div>

                <div className="flex items-center space-x-2 mb-3">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-700 font-medium">
                        {service.company_name || service.company.name}
                    </p>
                </div>

                {service.company.location && (
                    <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-600 text-sm">{service.company.location}</p>
                    </div>
                )}

                {service.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                )}

                <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-end">
                    {service.price_range ? (
                        <div className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="text-lg font-semibold text-green-600">
                                {service.price_range}
                            </span>
                        </div>
                    ) : (
                         <div className="flex items-center space-x-2 text-gray-500">
                            <DollarSign className="w-5 h-5" />
                            <span className="text-sm">Fiyat Belirtilmemiş</span>
                        </div>
                    )}
                    
                    {/* Talep Oluştur simgesi, kullanıcıya kartın tıklanabilir olduğunu gösterir */}
                    <div className="inline-flex items-center text-blue-500 hover:text-blue-700 font-semibold text-sm">
                        <MousePointerClick className="w-4 h-4 mr-1" />
                        Talep Oluştur
                    </div>
                </div>
            </div>
        </div>
    );
}