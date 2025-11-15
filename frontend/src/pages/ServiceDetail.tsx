import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, MapPin, DollarSign, Package, ChevronLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import { AddressSelector } from '../components/AddressSelector';
import { Address } from '../hooks/useAddresses';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

interface Service {
    id: number;
    title: string;
    description: string;
    price_range_min: number;
    price_range_max: number;
    company: {
        id: number;
        name: string;
        slug: string;
        location_text: string;
        phone?: string;
        email?: string;
        description?: string;
    };
    category?: {
        id: number;
        name: string;
        slug: string;
    };
}

interface ReferralFormData {
    customer_name: string;
    customer_email: string;
    offered_price: number;
    description: string;
}

export default function ServiceDetail() {
    const { serviceId } = useParams<{ serviceId: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');
    const isAuthenticated = !!token;

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showReferralForm, setShowReferralForm] = useState(false);
    const [priceError, setPriceError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<ReferralFormData>({
        customer_name: '',
        customer_email: '',
        offered_price: 0,
        description: '',
    });

    useEffect(() => {
        fetchService();
    }, [serviceId]);

    const fetchService = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/core/services/${serviceId}`);
            if (!res.ok) throw new Error('Hizmet yüklenemedi');
            const data = await res.json();
            setService(data);
        } catch (err: any) {
            setError(err?.message || 'Hizmet yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const validatePrice = (price: number) => {
        if (!service) return;
        if (price < service.price_range_min || price > service.price_range_max) {
            setPriceError(
                `Lütfen ${service.price_range_min} - ${service.price_range_max} TL arasında bir fiyat girin`
            );
            return false;
        }
        setPriceError(null);
        return true;
    };

    const handlePriceChange = (value: number) => {
        setFormData({ ...formData, offered_price: value });
        validatePrice(value);
    };

    const handleSubmitReferral = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePrice(formData.offered_price)) {
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                target_company_id: service?.company.id,
                requested_service_id: service?.id,
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                description: `Fiyat Teklifi: ${formData.offered_price} TL\n\n${formData.description}`,
            };

            const res = await fetch(`${API_BASE}/api/core/referral/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Başvuru gönderilemedi');
            }

            alert('✓ Başvurunuz gönderildi! Firma sizinle iletişime geçecektir.');
            setShowReferralForm(false);
            setFormData({
                customer_name: '',
                customer_email: '',
                offered_price: 0,
                description: '',
            });
        } catch (err: any) {
            alert(`Hata: ${err?.message || 'Başvuru gönderilemedi'}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <p>Hizmet bilgisi yükleniyor...</p>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Link to="/" className="inline-flex items-center text-blue-600 mb-6">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Geri Dön
                </Link>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-700">{error || 'Hizmet bulunamadı'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
                <ChevronLeft className="w-5 h-5 mr-1" /> Geri Dön
            </Link>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Service Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            {service.category && (
                                <div className="inline-block bg-blue-400 px-3 py-1 rounded-full text-sm mb-3">
                                    {service.category.name}
                                </div>
                            )}
                            <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
                            <p className="text-blue-100">{service.company.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold mb-2">
                                {service.price_range_min} - {service.price_range_max} TL
                            </div>
                            <p className="text-blue-100">Fiyat Aralığı</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2">
                        {/* Description */}
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Hizmet Açıklaması</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{service.description}</p>
                        </section>

                        {/* Price Note */}
                        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                            <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Fiyat Aralığı</h3>
                                    <p className="text-blue-800 text-sm">
                                        Teklifte bulunurken fiyatınız {service.price_range_min} - {service.price_range_max} TL arasında olmalıdır.
                                        Firmaya gönderilen teklif fiyatı bu aralık dışında ise reddedilebilir.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Reviews Placeholder */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Yorumlar</h2>
                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                <p className="text-gray-500">Henüz yorum bulunmamaktadır</p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar - Company Info & CTA */}
                    <div>
                        {/* Company Card */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h3 className="font-semibold mb-4">Firma Bilgileri</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Firma Adı</p>
                                    <p className="font-medium">{service.company.name}</p>
                                </div>

                                {service.company.location_text && (
                                    <div className="flex items-start">
                                        <MapPin className="w-4 h-4 text-gray-600 mr-2 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Konum</p>
                                            <p className="font-medium text-sm">{service.company.location_text}</p>
                                        </div>
                                    </div>
                                )}

                                {service.company.phone && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Telefon</p>
                                        <a href={`tel:${service.company.phone}`} className="font-medium text-blue-600 hover:underline">
                                            {service.company.phone}
                                        </a>
                                    </div>
                                )}

                                {service.company.email && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">E-posta</p>
                                        <a href={`mailto:${service.company.email}`} className="font-medium text-blue-600 hover:underline text-sm break-all">
                                            {service.company.email}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CTA Button */}
                        {isAuthenticated ? (
                            <button
                                onClick={() => setShowReferralForm(!showReferralForm)}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center mb-3"
                            >
                                <Send className="w-5 h-5 mr-2" />
                                {showReferralForm ? 'Formu Kapat' : 'Başvur'}
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="block text-center w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold mb-3"
                            >
                                Giriş Yaparak Başvur
                            </Link>
                        )}

                        {/* Support Link */}
                        <button
                            className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Müşteri Desteğine Ulaş
                        </button>
                    </div>
                </div>

                {/* Referral Form Modal */}
                {showReferralForm && isAuthenticated && (
                    <div className="border-t bg-gray-50 p-8">
                        <h2 className="text-lg font-semibold mb-6">Hizmet Başvurusu</h2>
                        <form onSubmit={handleSubmitReferral} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Adınız</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">E-posta</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        Teklif Fiyatı (TL)
                                    </div>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={service.price_range_min}
                                    max={service.price_range_max}
                                    value={formData.offered_price}
                                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${priceError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                                        }`}
                                    placeholder={`${service.price_range_min} - ${service.price_range_max}`}
                                />
                                {priceError && <p className="text-red-600 text-sm mt-1">{priceError}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Açıklama / Not</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                    placeholder="Ek bilgi veya özel istekler..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReferralForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !!priceError}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Gönderiliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Başvuru Gönder
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
