import { useState } from 'react';
import { useAddresses, Address, AddressInput } from '../hooks/useAddresses';
import Modal from './Modal';

interface AddressSelectorProps {
    onSelect: (address: Address) => void;
    selectedAddressId?: number;
    showLabel?: boolean;
}

export const AddressSelector = ({
    onSelect,
    selectedAddressId,
    showLabel = true,
}: AddressSelectorProps) => {
    const { addresses, loading, createAddress, deleteAddress, setDefaultAddress } = useAddresses();
    const [showModal, setShowModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<AddressInput>({
        full_address: '',
        street: '',
        district: '',
        city: '',
        postal_code: '',
        phone: '',
        is_default: false,
    });
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCreateAddress = async () => {
        try {
            setError(null);
            if (!formData.full_address.trim()) {
                setError('Lütfen tam adres giriniz');
                return;
            }
            if (!formData.city.trim()) {
                setError('Lütfen şehir seçiniz');
                return;
            }
            if (!formData.phone.trim()) {
                setError('Lütfen telefon numarası giriniz');
                return;
            }

            setIsCreating(true);
            const newAddress = await createAddress(formData);
            setFormData({
                full_address: '',
                street: '',
                district: '',
                city: '',
                postal_code: '',
                phone: '',
                is_default: false,
            });
            setShowModal(false);
            onSelect(newAddress);
        } catch (err) {
            setError('Adres oluşturma hatası');
        } finally {
            setIsCreating(false);
        }
    };

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    return (
        <div className="space-y-3">
            {showLabel && <label className="block text-sm font-medium text-gray-700">📍 Teslimat Adresi</label>}

            {addresses.length > 0 ? (
                <>
                    <div className="space-y-2">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedAddressId === address.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-300 bg-white'
                                    }`}
                                onClick={() => onSelect(address)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{address.city}</p>
                                        <p className="text-xs text-gray-600">{address.full_address}</p>
                                        <p className="text-xs text-gray-500">📱 {address.phone}</p>
                                    </div>
                                    {address.is_default && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Varsayılan</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full py-2 px-3 border border-dashed border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
                    >
                        + Yeni Adres Ekle
                    </button>
                </>
            ) : (
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                >
                    + Adres Ekle
                </button>
            )}

            {/* Adres Ekleme Modal */}
            {showModal && (
                <Modal
                    isOpen={showModal}
                    title="Yeni Adres Ekle"
                    onClose={() => {
                        setShowModal(false);
                        setError(null);
                    }}
                >
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tam Adres *</label>
                            <input
                                type="text"
                                name="full_address"
                                value={formData.full_address}
                                onChange={handleInputChange}
                                placeholder="Sokak, binanın adı vb."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Sokak/Cadde</label>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                placeholder="Sokak adı"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">İlçe</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                placeholder="İlçe adı"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Şehir *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="Şehir adı"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Posta Kodu</label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleInputChange}
                                placeholder="Posta kodu"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Telefon *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+90 5XX XXX XXXX"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_default"
                                checked={formData.is_default}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300"
                            />
                            <label className="ml-2 text-sm text-gray-700">Varsayılan adres olarak ayarla</label>
                        </div>

                        {error && <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">{error}</div>}

                        <div className="flex gap-2 pt-3">
                            <button
                                onClick={handleCreateAddress}
                                disabled={isCreating}
                                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium text-sm"
                            >
                                {isCreating ? 'Kaydediliyor...' : 'Adres Ekle'}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-medium text-sm"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
