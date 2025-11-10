// frontend/src/pages/FirmPanel.tsx (GÜNCEL LAYOUT BİLEŞENİ)

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Clock, Users, Building2, ChevronLeft } from 'lucide-react';

// Sekmelerin tanımı
interface Tab {
    path: string;
    label: string;
    icon: React.ElementType;
    managerOnly: boolean; // Sadece yöneticilerin görmesi gereken sekmeler
}

const tabs: Tab[] = [
    {
        path: 'requests',
        label: 'Gelen Talepler',
        icon: Clock,
        managerOnly: false,
    },
    {
        path: 'users',
        label: 'Kullanıcı Yönetimi',
        icon: Users,
        managerOnly: true, // Sadece Firma Yöneticisi görecek
    },
];

export default function FirmPanel() {
    const { isAuthenticated, isCompanyManager } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Yetki kontrolü (Daha önce ProtectedRoute tarafından yapılmış olsa da, navigasyon için gerekli)
    if (!isAuthenticated) {
        navigate('/login'); 
        return null;
    }

    // Aktif sekmeyi belirlemek için URL'in son parçasını alırız.
    const currentPath = location.pathname.split('/').pop() || 'requests';

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center border-b pb-2">
                    <Building2 className="w-7 h-7 mr-3 text-blue-600" />
                    Firma Yönetim Paneli
                </h1>

                {/* Sekme Navigasyonu */}
                <div className="flex border-b border-gray-200 mb-8">
                    {tabs
                        // isCompanyManager kontrolü ile sadece yetkili sekmeleri filtrele
                        .filter(tab => !tab.managerOnly || isCompanyManager) 
                        .map((tab) => (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`
                                    flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200
                                    ${currentPath === tab.path || (currentPath === 'firm-panel' && tab.path === 'requests') // Default request sayfasını aktif kabul et
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <tab.icon className="w-5 h-5 mr-2" />
                                {tab.label}
                            </Link>
                        ))}
                </div>

                {/* Sekme İçeriği */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    {/* Alt rotaların içeriği burada gösterilir (ReferralList veya FirmUserManagement) */}
                    <Outlet /> 
                </div>
                
                {/* Ana sayfaya dön butonu */}
                <div className="mt-8">
                     <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                         <ChevronLeft className="w-5 h-5 mr-1" />
                         Ana Sayfaya Dön
                     </Link>
                 </div>
            </div>
        </div>
    );
}