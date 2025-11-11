import { useState, useEffect } from 'react';
import { Heart, X } from 'lucide-react';
import { storage } from '../utils/storage';
import type { FavoriteService } from '../types';
import EnhancedServiceCard from './EnhancedServiceCard';

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceClick?: (service: any) => void;
}

export default function FavoritesPanel({ isOpen, onClose, onServiceClick }: FavoritesPanelProps) {
  const [favorites, setFavorites] = useState<FavoriteService[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFavorites(storage.getFavorites());
    }
  }, [isOpen]);

  const handleServiceClick = (service: any) => {
    if (onServiceClick) onServiceClick(service);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl h-full shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-red-500 fill-current" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Favorilerim</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Henüz favori hizmet eklemediniz
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Beğendiğiniz hizmetleri kalp ikonuna tıklayarak ekleyin
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {favorites.map((fav) => (
                <EnhancedServiceCard
                  key={fav.serviceId}
                  service={fav.service}
                  onClick={() => handleServiceClick(fav.service)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
