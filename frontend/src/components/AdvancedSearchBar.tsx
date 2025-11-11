import { useState, useEffect, type FormEvent } from 'react';
import { Search, MapPin, Clock, X, TrendingUp } from 'lucide-react';
import { storage } from '../utils/storage';
import type { RecentSearch } from '../types';

interface AdvancedSearchBarProps {
  onSearchSubmit: (query: string, location: string) => Promise<void>;
}

export default function AdvancedSearchBar({ onSearchSubmit }: AdvancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [suggestions] = useState([
    'İşlemci pin tamiri',
    'Laptop ekran değişimi',
    'Cep telefonu cam değişimi',
    'Klima bakımı',
    'Araba motor tamiri',
    'Web sitesi geliştirme',
  ]);

  useEffect(() => {
    setRecentSearches(storage.getRecentSearches());
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Lütfen bir arama terimi girin');
      return;
    }

    setIsLoading(true);
    setError('');
    setShowSuggestions(false);

    try {
      storage.addRecentSearch(query, location);
      await onSearchSubmit(query, location);
      setRecentSearches(storage.getRecentSearches());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Arama başlatılamadı';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearchClick = (search: RecentSearch) => {
    setQuery(search.query);
    setLocation(search.location);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    storage.clearRecentSearches();
    setRecentSearches([]);
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Hangi hizmeti arıyorsunuz?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Konum (opsiyonel)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Aranıyor...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              Ara
            </span>
          )}
        </button>

        {error && (
          <div className="mt-3 text-red-600 dark:text-red-400 text-sm text-center animate-shake">
            {error}
          </div>
        )}
      </form>

      {showSuggestions && (query || recentSearches.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
          {query && filteredSuggestions.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>Öneriler</span>
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Son Aramalar</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  Temizle
                </button>
              </div>
              {recentSearches.slice(0, 5).map((search) => (
                <button
                  key={search.id}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-700 dark:text-gray-300 font-medium">{search.query}</div>
                      {search.location && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {search.location}
                        </div>
                      )}
                    </div>
                    <X className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
