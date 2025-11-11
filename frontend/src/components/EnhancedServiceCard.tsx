import { useState } from 'react';
import { Building2, DollarSign, MapPin, Heart, ExternalLink, Star } from 'lucide-react';
import type { IService } from '../types';
import { storage } from '../utils/storage';

interface EnhancedServiceCardProps {
  service: IService;
  onClick: () => void;
}

export default function EnhancedServiceCard({ service, onClick }: EnhancedServiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(storage.isFavorite(service.id));
  const [isHovered, setIsHovered] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      storage.removeFavorite(service.id);
    } else {
      storage.addFavorite(service);
    }
    setIsFavorite(!isFavorite);
  };

  const formatPriceRange = () => {
    if (service.price_range_min && service.price_range_max) {
      return `₺${service.price_range_min.toLocaleString()} - ₺${service.price_range_max.toLocaleString()}`;
    }
    return service.price_range || 'Fiyat bilgisi yok';
  };

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full relative">
        <button
          onClick={toggleFavorite}
          className="absolute top-0 right-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
        >
          <Heart
            className={`w-5 h-5 transition-all duration-300 ${
              isFavorite
                ? 'fill-red-500 text-red-500 scale-110'
                : 'text-gray-400 hover:text-red-400'
            }`}
          />
        </button>

        <div className="flex items-start justify-between mb-4 pr-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1 leading-tight">
            {service.title}
          </h3>
          <div className="flex-shrink-0 ml-2">
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold">4.8</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <p className="text-gray-700 dark:text-gray-300 font-medium truncate">
            {service.company_name || service.company.name}
          </p>
        </div>

        {service.company.location && (
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
              {service.company.location}
            </p>
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
          {service.description}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fiyat Aralığı</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatPriceRange()}
            </span>
          </div>

          <div
            className={`flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400 text-sm font-semibold transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
          >
            <span>Detayları Görüntüle</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
