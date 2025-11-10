import { type IService } from '../types/api';
import { Building2, DollarSign, MapPin } from 'lucide-react';

interface ServiceCardProps {
    service: IService;
}

export default function ServiceCard({ service }: ServiceCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200">
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

                <div className="mt-auto pt-4 border-t border-gray-200">
                    {service.price_range && (
                        <div className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="text-lg font-semibold text-green-600">
                                {service.price_range}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
