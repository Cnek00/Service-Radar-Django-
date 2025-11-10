import { useState } from 'react';
const SearchBar = ({ onSearchResults }: { onSearchResults: (results: IService[]) => void }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Attempt to fetch results from a backend endpoint; if not available, return an empty array
            const res = await fetch(`/api/services?query=${encodeURIComponent(query)}`);
            if (!res.ok) {
                onSearchResults([]);
            } else {
                const data = await res.json();
                onSearchResults(data as IService[]);
            }
        } catch {
            onSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Hizmet, sektör veya şirket adı girin"
                    className="w-full px-4 py-2 border rounded-md"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                >
                    {loading ? 'Aranıyor...' : 'Ara'}
                </button>
            </div>
        </form>
    );
};
import ServiceCard from '../components/ServiceCard';
import { type IService } from '../types/api';

export default function HomePage() {
    const [services, setServices] = useState<IService[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearchResults = (results: IService[]) => {
        setServices(results);
        setHasSearched(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Hizmet Arayın
                        </h1>
                        <p className="text-lg text-gray-600">
                            İhtiyacınız olan hizmeti bulun ve firmalarla iletişime geçin
                        </p>
                    </div>

                    <SearchBar onSearchResults={handleSearchResults} />

                    <div className="mt-12">
                        {hasSearched && services.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">
                                    Arama kriterlerinize uygun hizmet bulunamadı.
                                </p>
                            </div>
                        )}

                        {services.length > 0 && (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Arama Sonuçları ({services.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {services.map((service) => (
                                        <ServiceCard key={service.id} service={service} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
