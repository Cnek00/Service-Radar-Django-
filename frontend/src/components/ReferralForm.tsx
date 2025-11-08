// frontend/src/components/ReferralForm.tsx

import React, { useState } from 'react';
import { type IReferralRequestIn, type IService } from '../types/api';
import { createReferral } from '../apiClient';

// Bileşenin alacağı prop'ların (özelliklerin) tipini tanımlıyoruz
interface ReferralFormProps {
    service: IService; // Hangi hizmet için talep gönderileceğini bilmek için
    onSuccess: (message: string) => void; // Başarı durumunda App.tsx'e bildirim göndermek için
}

const ReferralForm: React.FC<ReferralFormProps> = ({ service, onSuccess }) => {
    // Form verilerini tutacak state
    const [formData, setFormData] = useState<IReferralRequestIn>({
        target_company_id: service.company.id,
        requested_service_id: service.id,
        customer_name: '',
        customer_email: '',
        description: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // Form alanları değiştiğinde state'i güncelleme
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Form gönderildiğinde
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmissionError(null);

        try {
            // API'ye POST isteğini gönderiyoruz
            await createReferral(formData);
            
            // Başarılı olduğunda ana bileşene bildirim gönder
            onSuccess('Talebiniz başarıyla gönderildi! Firma sizinle iletişime geçecektir.');

            // Formu sıfırla
            setFormData({ ...formData, customer_name: '', customer_email: '', description: '' });

        } catch (error) {
            // Hata oluştuğunda mesajı göster
            setSubmissionError('Talep gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '15px', marginTop: '10px' }}>
            <h4>{service.company.name} firmasına talep gönder</h4>
            {submissionError && <p style={{ color: 'red' }}>{submissionError}</p>}

            <div>
                <label>Adınız:</label>
                <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <div style={{ marginTop: '10px' }}>
                <label>E-posta Adresiniz:</label>
                <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <div style={{ marginTop: '10px' }}>
                <label>Açıklama/Detaylar:</label>
                <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <button type="submit" disabled={loading} style={{ marginTop: '15px' }}>
                {loading ? 'Gönderiliyor...' : 'Hizmet Talebi Gönder'}
            </button>
        </form>
    );
};

export default ReferralForm;