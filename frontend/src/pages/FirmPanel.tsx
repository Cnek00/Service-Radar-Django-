// src/pages/FirmPanel.tsx (Varsayılan dosya adı)

import React, { useState, useEffect } from 'react';
// types/api içinden ReferralRequest tipini import ettiğinizi varsayıyorum
import { type IReferralRequestOut } from '../types/api'; 
// API fonksiyonlarını import ediyoruz
import { fetchFirmReferrals, handleReferralAction } from '../apiClient'; 
import { isAuthenticated } from '../authService'; 
// Kullanacağınız CSS kütüphanesine göre (Tailwind/Bootstrap vb.) stillendirme yapılabilir.

// Component için durumları tanımlayalım
interface FirmPanelState {
  referrals: IReferralRequestOut[];
  loading: boolean;
  error: string | null;
}

const FirmPanel: React.FC = () => {
  const [state, setState] = useState<FirmPanelState>({
    referrals: [],
    loading: true,
    error: null,
  });

  const loadReferrals = async () => {
    // Eğer kullanıcı giriş yapmadıysa, yükleme yapma
    if (!isAuthenticated()) {
        setState(s => ({ ...s, loading: false, error: "Giriş yapınız." }));
        return;
    }
      
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      // apiClient.ts dosyasından yetkili isteği çekiyoruz
      const data = await fetchFirmReferrals();
      setState(s => ({ ...s, referrals: data || [], loading: false }));
    } catch (err: any) {
      console.error("Talep yükleme hatası:", err.message);
      // Hata genellikle 401 Unauthorized olur (token süresi dolmuştur)
      setState(s => ({ 
        ...s, 
        error: err.message || "Talepler yüklenirken bir hata oluştu.", 
        loading: false 
      }));
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []); // Component yüklendiğinde bir kez çalışır.

  // Talep Kabul Etme/Reddetme İşlemi
  const handleAction = async (requestId: number, action: 'accept' | 'reject') => {
    if (window.confirm(`ID ${requestId} olan talebi ${action === 'accept' ? 'KABUL ETMEK' : 'REDDETMEK'} istediğinizden emin misiniz?`)) {
        try {
            // JWT korumalı POST isteği atılıyor
            const result = await handleReferralAction(requestId, action);
            
            alert(result.message);
            
            // İşlem başarılıysa listeyi yeniden yükle
            loadReferrals(); 

        } catch (error: any) {
            alert(`İşlem başarısız oldu: ${error.message}`);
        }
    }
  };


  if (state.loading) {
    return <div className="p-4 text-center">Talepler yükleniyor...</div>;
  }

  if (state.error) {
    return <div className="p-4 text-red-600 text-center">Hata: {state.error}</div>;
  }
  
  // =======================================================
  // REFERANS LİSTESİ GÖRÜNÜMÜ
  // =======================================================
  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Firma Talepleri Paneli ({state.referrals.length} Talep)</h1>
      
      {state.referrals.length === 0 ? (
          <div className="text-center text-gray-500">Henüz size ulaşan bir talep bulunmamaktadır.</div>
      ) : (
          <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-100">
                      <tr>
                          <th className="py-2 px-4 border-b">ID</th>
                          <th className="py-2 px-4 border-b">Hizmet Adı</th>
                          <th className="py-2 px-4 border-b">Müşteri</th>
                          <th className="py-2 px-4 border-b">Durum</th>
                          <th className="py-2 px-4 border-b">Tarih</th>
                          <th className="py-2 px-4 border-b">Aksiyon</th>
                      </tr>
                  </thead>
                  <tbody>
                      {state.referrals.map((referral) => (
                          <tr key={referral.id} className="hover:bg-gray-50">
                              <td className="py-2 px-4 border-b">{referral.id}</td>
                              <td className="py-2 px-4 border-b font-medium">{referral.requested_service.title}</td>
                              <td className="py-2 px-4 border-b">
                                  {referral.customer_name} ({referral.customer_email})
                              </td>
                              <td className="py-2 px-4 border-b">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                      referral.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                      referral.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                  }`}>
                                      {referral.status.toUpperCase()}
                                  </span>
                              </td>
                              <td className="py-2 px-4 border-b">{new Date(referral.created_at).toLocaleDateString()}</td>
                              <td className="py-2 px-4 border-b space-x-2">
                                  {referral.status === 'pending' && (
                                      <>
                                          <button 
                                              onClick={() => handleAction(referral.id, 'accept')}
                                              className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded"
                                          >
                                              Kabul Et
                                          </button>
                                          <button 
                                              onClick={() => handleAction(referral.id, 'reject')}
                                              className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
                                          >
                                              Reddet
                                          </button>
                                      </>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}
    </div>
  );
};

export default FirmPanel;