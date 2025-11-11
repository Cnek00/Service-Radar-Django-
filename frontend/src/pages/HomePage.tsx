import { useState, useEffect } from 'react';
import { SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react';
import AdvancedSearchBar from '../components/AdvancedSearchBar';
import EnhancedServiceCard from '../components/EnhancedServiceCard';
import FilterPanel from '../components/FilterPanel';
import type { IService, FilterOptions } from '../types';

interface HomePageProps {
  onSuccess: (message: string) => void;
}

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function HomePage({ onSuccess }: HomePageProps) {
  const [services, setServices] = useState<IService[]>([]);
  const [filteredServices, setFilteredServices] = useState<IService[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});

  useEffect(() => {
    applyFilters();
  }, [services, activeFilters]);

  const searchServices = async (query: string, location: string): Promise<IService[]> => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (location) params.append('location', location);

      const url = `${API_BASE_URL}/core/services/search?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Arama hatası: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  };

  const handleSearchSubmit = async (query: string, location: string) => {
    setIsLoading(true);
    try {
      const results = await searchServices(query, location);
      setServices(results);
      setHasSearched(true);
    } catch (error) {
      onSuccess('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    if (activeFilters.priceMin !== undefined) {
      filtered = filtered.filter(
        s => s.price_range_min === null || s.price_range_min >= activeFilters.priceMin!
      );
    }

    if (activeFilters.priceMax !== undefined) {
      filtered = filtered.filter(
        s => s.price_range_max === null || s.price_range_max <= activeFilters.priceMax!
      );
    }

    if (activeFilters.location) {
      filtered = filtered.filter(s =>
        s.company.location?.toLowerCase().includes(activeFilters.location!.toLowerCase())
      );
    }

    if (activeFilters.category) {
      filtered = filtered.filter(s =>
        s.category?.toLowerCase() === activeFilters.category!.toLowerCase()
      );
    }

    if (activeFilters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (activeFilters.sortBy) {
          case 'price':
            const aPrice = a.price_range_min || 0;
            const bPrice = b.price_range_min || 0;
            comparison = aPrice - bPrice;
            break;
          case 'name':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'recent':
          default:
            comparison = b.id - a.id;
        }

        return activeFilters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    setFilteredServices(filtered);
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const handleCardClick = (service: IService) => {
    console.log('Service clicked:', service);
  };

  return (
    <div className="pt-8 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-yellow-500 mr-3" />
            Hizmetleri Keşfedin
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Aradığınız her türlü hizmeti bulun, karşılaştırın ve başvurun
          </p>
        </div>

        <AdvancedSearchBar onSearchSubmit={handleSearchSubmit} />

        {hasSearched && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Arama Sonuçları
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                  {filteredServices.length} sonuç
                </span>
              </div>

              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Filtrele</span>
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                  Sonuç Bulunamadı
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Arama kriterlerinize uygun hizmet bulunamadı. Lütfen farklı anahtar kelimeler deneyin.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <EnhancedServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => handleCardClick(service)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Popüler Kategoriler
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Elektronik', icon: '⚡', color: 'from-blue-500 to-blue-600' },
                { name: 'Mekanik', icon: '🔧', color: 'from-gray-500 to-gray-600' },
                { name: 'Yazılım', icon: '💻', color: 'from-green-500 to-green-600' },
                { name: 'Bakım', icon: '🛠️', color: 'from-orange-500 to-orange-600' },
                { name: 'Danışmanlık', icon: '💼', color: 'from-purple-500 to-purple-600' },
                { name: 'Tasarım', icon: '🎨', color: 'from-pink-500 to-pink-600' },
              ].map((category) => (
                <button
                  key={category.name}
                  className={`bg-gradient-to-br ${category.color} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
                >
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <div className="font-semibold">{category.name}</div>
                </button>
              ))}
            </div>

            <div className="mt-16 text-center py-12 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🚀 Nasıl Çalışır?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                  <div className="text-4xl mb-3">🔍</div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Ara</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    İhtiyacınız olan hizmeti arayın ve filtreleyin
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                  <div className="text-4xl mb-3">⭐</div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Karşılaştır</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Firmaları ve fiyatları karşılaştırın
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                  <div className="text-4xl mb-3">📧</div>
                  <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Başvur</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Hemen talep gönderin ve teklif alın
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
