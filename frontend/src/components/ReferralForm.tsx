// frontend/src/components/ReferralForm.tsx (GÜNCELLENDİ)

import React, { useState, type FormEvent } from 'react';
import { type IReferralRequestIn, type IService } from '../types/api';
import { createReferral } from '../apiClient';
import { Send, User, Mail, MessageSquare } from 'lucide-react'; 

// YENİ BİLEŞENLERİ İMPORT ET
import Input from './Input';
import Button from './Button'; 

interface ReferralFormProps {
    service: IService;
    onSuccess: (message: string) => void;
}

const ReferralForm: React.FC<ReferralFormProps> = ({ service, onSuccess }) => {
    const [formData, setFormData] = useState<IReferralRequestIn>({
        target_company_id: service.company.id,
        requested_service_id: service.id,
        customer_name: '',
        customer_email: '',
        description: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // Hem input hem de textarea için çalışacak tek bir handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmissionError(null);

        try {
            await createReferral(formData);
            
            onSuccess('Talebiniz başarıyla gönderildi! Firma size en kısa sürede geri dönüş yapacaktır.');
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Talep gönderilemedi.';
            setSubmissionError(`Gönderme başarısız: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };
    
    // Fiyat aralığı bilgisini formatlama
    const priceInfo = service.price_range 
        ? `Bu hizmet için beklenen fiyat aralığı: ${service.price_range}`
        : 'Firma fiyat aralığı belirtmemiştir. Lütfen açıklamanızda fiyat beklentinizi belirtin.';

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            
            {/* Hata Mesajı */}
            {submissionError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
                    {submissionError}
                </div>
            )}
            
            {/* Hizmet Bilgisi */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                <p className="font-semibold text-blue-800 mb-1">{service.title}</p>
                <p>{priceInfo}</p>
            </div>
            
            {/* Müşteri Adı - YENİ INPUT BİLEŞENİ KULLANILDI */}
            <Input
                icon={User}
                type="text"
                name="customer_name"
                placeholder="Adınız ve Soyadınız"
                value={formData.customer_name}
                onChange={handleChange}
                isLoading={loading}
                required
            />
            
            {/* Müşteri E-postası - YENİ INPUT BİLEŞENİ KULLANILDI */}
            <Input
                icon={Mail}
                type="email"
                name="customer_email"
                placeholder="E-posta Adresiniz"
                value={formData.customer_email}
                onChange={handleChange}
                isLoading={loading}
                required
            />
            
            {/* Açıklama/Detaylar - TEXTAREA için uyumlu stiller */}
            <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    <MessageSquare className="w-4 h-4 mr-1 inline-block align-text-bottom text-gray-500" />
                    İşinizi Detaylı Açıklayın (Gerekli)
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    disabled={loading} // Loading durumunu yansıt
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y
                        ${loading ? 'bg-gray-100 border-gray-300' : 'border-gray-300 hover:border-gray-400'}`
                    }
                    placeholder="İhtiyacınız olan hizmeti, bütçenizi ve aciliyetinizi detaylıca açıklayın."
                />
            </div>
            
            {/* SUBMIT BUTONU - YENİ BUTTON BİLEŞENİ KULLANILDI */}
            <Button 
                type="submit" 
                variant="primary" 
                isLoading={loading} 
                icon={Send}
                className="w-full mt-6"
            >
                Hizmet Talebi Gönder
            </Button>
        </form>
    );
}

export default ReferralForm;