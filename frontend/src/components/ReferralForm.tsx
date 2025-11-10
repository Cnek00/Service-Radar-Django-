// frontend/src/components/ReferralForm.tsx

import React, { useState } from 'react';
import { type IReferralRequestIn, type IService } from '../types/api';
import { createReferral } from '../apiClient';
import { Send } from 'lucide-react';

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
            
            onSuccess('Talebiniz başarıyla gönderildi! Firma sizinle iletişime geçecektir.');

            setFormData({ 
                ...formData, 
                customer_name: '', 
                customer_email: '', 
                description: '' 
            });

        } catch (error: any) {
            const message = error.message.includes('400') ? 'Lütfen tüm alanları doğru doldurunuz.' : 'Talep gönderilirken bir hata oluştu.';
            setSubmissionError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-3">
            <h4 className="text-lg font-semibold text-blue-700">
                {service.company.name} firmasına talep gönder
            </h4>
            
            {submissionError && (
                <p className="p-2 bg-red-100 text-red-700 rounded text-sm">{submissionError}</p>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adınız:</label>
                <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresiniz:</label>
                <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama/Detaylar:</label>
                <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            <button 
                type="submit" 
                disabled={loading} 
                className="w-full inline-flex justify-center items-center py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
                {loading ? 'Gönderiliyor...' : (
                    <>
                        <Send className="w-5 h-5 mr-2" /> Hizmet Talebi Gönder
                    </>
                )}
            </button>
        </form>
    );
};

export default ReferralForm;