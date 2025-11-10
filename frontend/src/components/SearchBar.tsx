// frontend/src/components/SearchBar.tsx

import { useState, type FormEvent } from 'react';
import { Search, MapPin } from 'lucide-react';
// searchServices artık doğrudan burada çağrılmıyor, HomePage'e iletiyor
// import type { IService } from '../types/api';

interface SearchBarProps {
  // Arama verilerini ana bileşene iletir
  onSearchSubmit: (query: string, location: string) => Promise<void>; 
}

export default function SearchBar({ onSearchSubmit }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // En az bir alanın dolu olmasını zorlayabilirsiniz, ancak şimdilik boş aramaya izin veriyoruz.
    
    setIsLoading(true);
    setError('');

    try {
      // Veriyi ana bileşene iletiyoruz, API çağrısı HomePage'de yapılacak
      await onSearchSubmit(query, location); 
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Arama başlatılamadı';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Hizmet ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Konum..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Aranıyor...' : 'Ara'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}