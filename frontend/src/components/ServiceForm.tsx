// frontend/src/components/ServiceForm.tsx (YENİ BİLEŞEN)

import React, { useState, type FormEvent } from 'react';
import { 
    type IService, 
    type IServiceCreateIn, 
    type IServiceUpdateIn,
    type IServicePayload
} from '../types/api';
import { Loader2, Save, XCircle, PlusCircle } from 'lucide-react';
import { createFirmService, updateFirmService } from '../apiClient'; 

// Formun hem oluşturma hem de güncelleme için kullanılabilmesi için interface
interface ServiceFormProps {
    // Eğer null ise, yeni hizmet oluşturuluyor demektir
    serviceToEdit: IService | null; 
    // Başarılı işlem sonrası çağrılacak ve hizmet listesini güncelleyecek fonksiyon
    onSuccess: (message: string) => void; 
    // Modal'ı kapatmak için
    onClose: () => void; 
}

const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

// Başlangıç formu state'i
const initialFormData: IServiceCreateIn = {
    title: '',
    description: '',
    price_range: '', 
    price_range_min: null,
    price_range_max: null,
};

export default function ServiceForm({ serviceToEdit, onSuccess, onClose }: ServiceFormProps) {
    // Düzenleme modunda ise, düzenlenecek hizmetin verileriyle başla
    const [formData, setFormData] = useState<IServiceCreateIn>(() => {
        if (serviceToEdit) {
            // Düzenleme için var olan verileri kullan
            return {
                title: serviceToEdit.title,
                description: serviceToEdit.description,
                price_range: serviceToEdit.price_range,
                price_range_min: serviceToEdit.price_range_min, 
                price_range_max: serviceToEdit.price_range_max,
            };
        }
        return initialFormData;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!serviceToEdit;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        let finalValue: string | number | null = value;
        if (name === 'price_range_min' || name === 'price_range_max') {
             // Sadece sayı veya boşluk kabul et. Boşsa null olarak kaydet.
             const numValue = value === '' ? null : Number(value);
             finalValue = (numValue === null || isNaN(numValue)) ? null : numValue;
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue,
        }));
    };
    
    // Fiyat alanları için özel bir temizleyici/düzenleyici
    // Eğer min > max ise, yerlerini değiştirir.
    const normalizePriceRanges = (data: IServiceCreateIn): IServicePayload => {
        let { price_range_min: min, price_range_max: max } = data;

        // Her ikisi de varsa ve min > max ise yer değiştir
        if (min !== null && max !== null && min > max) {
            [min, max] = [max, min];
        }
        
        return {
            ...data,
            price_range_min: min,
            price_range_max: max,
        };
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Fiyat aralıklarını normalleştir
            const payload = normalizePriceRanges(formData);
            
            if (isEditing && serviceToEdit) {
                // GÜNCELLEME İŞLEMİ
                await updateFirmService(serviceToEdit.id, payload as IServiceUpdateIn);
                onSuccess(`'${payload.title}' hizmeti başarıyla güncellendi.`);
            } else {
                // OLUŞTURMA İŞLEMİ
                await createFirmService(payload as IServiceCreateIn);
                onSuccess(`Yeni hizmet ('${payload.title}') başarıyla oluşturuldu.`);
            }
            onClose(); // İşlem başarılıysa modalı kapat
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'İşlem sırasında bir hata oluştu.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hata Mesajı */}
            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
                    {error}
                </div>
            )}
            
            {/* Başlık */}
            <div>
                <label htmlFor="title" className={labelClass}>Hizmet Başlığı</label>
                <input 
                    type="text" 
                    id="title"
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    maxLength={100}
                    className={inputClass} 
                    disabled={isLoading}
                />
            </div>
            
            {/* Açıklama */}
            <div>
                <label htmlFor="description" className={labelClass}>Açıklama / Detaylar</label>
                <textarea
                    id="description"
                    name="description" 
                    rows={4}
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    className={inputClass} 
                    disabled={isLoading}
                />
            </div>

            {/* Fiyat Aralıkları Grubu */}
            <h4 className="text-md font-semibold text-gray-800 pt-2">Fiyat Bilgileri (Opsiyonel)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Min Fiyat */}
                <div>
                    <label htmlFor="price_range_min" className={labelClass}>Min. Fiyat (TL)</label>
                    <input 
                        type="number" 
                        id="price_range_min"
                        name="price_range_min" 
                        // null ise boş string göster
                        value={formData.price_range_min ?? ''} 
                        onChange={handleChange} 
                        min="0"
                        step="0.01"
                        className={inputClass} 
                        disabled={isLoading}
                    />
                </div>
                
                {/* Max Fiyat */}
                <div>
                    <label htmlFor="price_range_max" className={labelClass}>Max. Fiyat (TL)</label>
                    <input 
                        type="number" 
                        id="price_range_max"
                        name="price_range_max" 
                        // null ise boş string göster
                        value={formData.price_range_max ?? ''} 
                        onChange={handleChange} 
                        min="0"
                        step="0.01"
                        className={inputClass} 
                        disabled={isLoading}
                    />
                </div>
                
                {/* Metinsel Fiyat Aralığı */}
                <div>
                    <label htmlFor="price_range" className={labelClass}>Özel Fiyat Aralığı Metni</label>
                    <input 
                        type="text" 
                        id="price_range"
                        name="price_range" 
                        value={formData.price_range} 
                        onChange={handleChange} 
                        placeholder="Örn: Pazarlığa Açık"
                        maxLength={50}
                        className={inputClass} 
                        disabled={isLoading}
                    />
                    <p className='text-xs text-gray-500 mt-1'>Sayı alanları boşsa bu metin gösterilir.</p>
                </div>
            </div>

            {/* Submit Butonu */}
            <button
                type="submit"
                disabled={isLoading}
                className={`w-full inline-flex justify-center items-center py-3 px-4 rounded-lg font-semibold transition-colors shadow-md ${
                    isEditing 
                        ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400' 
                        : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                } text-white disabled:cursor-not-allowed mt-6`}
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : isEditing ? (
                    <Save className="w-5 h-5 mr-2" />
                ) : (
                    <PlusCircle className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Kaydediliyor...' : isEditing ? 'Değişiklikleri Kaydet' : 'Hizmeti Oluştur'}
            </button>
            
            {/* Kapat Butonu */}
            <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center items-center py-2 px-4 text-gray-600 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors mt-2"
            >
                <XCircle className="w-5 h-5 mr-2" />
                İptal
            </button>
        </form>
    );
}