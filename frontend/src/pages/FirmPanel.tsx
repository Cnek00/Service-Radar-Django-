// frontend/src/pages/FirmPanel.tsx (GÜNCELLENDİ: Hizmet Yönetimi Sekmesi Eklendi)

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Clock, Users, Building2, ChevronLeft, Package, Settings } from 'lucide-react';


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
        // YENİ SEKME: Firma Hizmetleri
        path: 'services',
        label: 'Hizmet Yönetimi',
        icon: Package, // Yeni ikon
        managerOnly: true, // Hizmet yönetimi sadece yöneticiye ait olmalı
    },
    {
        path: 'users',
        label: 'Kullanıcı Yönetimi',
        icon: Users,
        managerOnly: true, // Sadece Firma Yöneticisi görecek
    },
    {
        path: 'settings',
        label: 'Firma Ayarları',
        icon: Settings,
        managerOnly: true,
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
    const currentPath = location.pathname.split('/').pop() || 'requests'; // Default: requests

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <Building2 className="w-7 h-7 mr-3 text-red-600" /> Firma Yönetim Paneli
                </h1>

                {/* Yan Menü (Sekmeler) */}
                <div className="flex space-x-2 border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap">
                    {tabs
                        // Sadece yönetici olmayanlar için managerOnly: false olanları göster
                        .filter(tab => !tab.managerOnly || isCompanyManager)
                        .map((tab) => (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={`
                                    flex items-center px-4 py-3 text-base font-medium transition-colors duration-200
                                    ${currentPath === tab.path || (currentPath === 'firm-panel' && tab.path === 'requests')
                                        ? 'border-b-4 border-blue-600 text-blue-600 bg-white shadow-t' // Aktif sekme stili
                                        : 'text-gray-600 hover:text-blue-800 hover:bg-gray-100 border-b-4 border-transparent'
                                    }
                                    -mb-px rounded-t-lg
                                `}
                            >
                                <tab.icon className="w-5 h-5 mr-2" />
                                {tab.label}
                            </Link>
                        ))
                    }
                </div>

                {/* Sekme İçeriği */}
                {/* Ana içerik Outlet ile gösterilecek. Stil FirmPanel'e taşındı. */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    {/* Alt rotaların içeriği burada gösterilir */}
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