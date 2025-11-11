import { useState } from 'react';
import { X, SlidersHorizontal, DollarSign, MapPin, Tag, ArrowUpDown } from 'lucide-react';
import type { FilterOptions } from '../types';

interface FilterPanelProps {
  onApplyFilters: (filters: FilterOptions) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function FilterPanel({ onApplyFilters, onClose, isOpen }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    priceMin: undefined,
    priceMax: undefined,
    location: '',
    category: '',
    sortBy: 'recent',
    sortOrder: 'desc',
  });

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      priceMin: undefined,
      priceMax: undefined,
      location: '',
      category: '',
      sortBy: 'recent',
      sortOrder: 'desc',
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <SlidersHorizontal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Filtreler</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6">
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <DollarSign className="w-4 h-4" />
                <span>Fiyat Aralığı</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin || ''}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax || ''}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <MapPin className="w-4 h-4" />
                <span>Konum</span>
              </label>
              <input
                type="text"
                placeholder="Şehir veya bölge"
                value={filters.location || ''}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Tag className="w-4 h-4" />
                <span>Kategori</span>
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Tüm Kategoriler</option>
                <option value="elektronik">Elektronik Tamir</option>
                <option value="mekanik">Mekanik Servis</option>
                <option value="yazilim">Yazılım Hizmetleri</option>
                <option value="bakim">Bakım ve Onarım</option>
                <option value="danismanlik">Danışmanlık</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <ArrowUpDown className="w-4 h-4" />
                <span>Sıralama</span>
              </label>
              <div className="space-y-3">
                <select
                  value={filters.sortBy || 'recent'}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="recent">En Yeni</option>
                  <option value="price">Fiyat</option>
                  <option value="name">İsim</option>
                </select>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="asc">Artan</option>
                  <option value="desc">Azalan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleApply}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Filtreleri Uygula
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold transition-colors"
            >
              Sıfırla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
