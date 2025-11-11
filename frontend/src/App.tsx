// frontend/src/App.tsx (GÜNCELLENDİ: FirmServiceList rotası eklendi)

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Yetkilendirme Servisi
import { isAuthenticated, isSuperuser } from './authService'; 
// import { useAuth } from './hooks/useAuth'; // Eğer useAuth hook'unu kullanıyorsanız

// Bileşenler ve Sayfalar
import Header from './components/Header';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register'; // Müşteri Kayıt Sayfası
import FirmRegister from './pages/FirmRegister'; // Firma Kayıt Sayfası
import FirmPanel from './pages/FirmPanel';
import ReferralList from './pages/ReferralList'; // Firma Paneli Alt Rotası 1
import FirmServiceList from './pages/FirmServiceList'; // YENİ: Firma Hizmet Yönetimi
import FirmUserManagement from './pages/FirmUserManagement'; // Firma Paneli Alt Rotası 2
import AdminPanel from './pages/AdminPanel'; // Admin Paneli
import NotFound from './pages/NotFound';

// ------------------------------------------------------------------
// KORUMALI ROTA BİLEŞENİ
// ------------------------------------------------------------------

// useAuth hook'unu kullanmıyorsanız bu yapı yeterli.
interface ProtectedRouteProps {
    element: React.FC<any>; // React.FC'nin props alabilmesi için any
    mustBeAdmin?: boolean; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element: Component, mustBeAdmin }) => {
    // 1. Oturum kontrolü
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // 2. Admin yetki kontrolü
    if (mustBeAdmin && !isSuperuser()) {
        // Normal bir kullanıcı admin paneline girmeye çalışırsa ana sayfaya yönlendir
        return <Navigate to="/" replace />;
    }
    
    // Geçerliyse bileşeni render et
    return <Component />;
};


function App() {
    // Başarı mesajı göstermek için state (Genellikle toast/bildirim sistemi kullanılır)
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSuccess = (message: string) => {
        setSuccessMessage(message);
        // 5 saniye sonra mesajı temizle
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Header />

                {/* Başarı Mesajı Bildirimi */}
                {successMessage && (
                    <div 
                        className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50 rounded-lg shadow-lg" 
                        role="alert"
                    >
                        <p className="font-bold">Başarılı!</p>
                        <p>{successMessage}</p>
                    </div>
                )}

                <main className="flex-grow container mx-auto p-4 max-w-7xl">
                    <Routes>
                        <Route path="/" element={<HomePage onSuccess={handleSuccess} />} /> 
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} /> 
                        <Route path="/firm-register" element={<FirmRegister />} />
                        
                        {/* Korumalı Firma Paneli ve Alt Rotaları */}
                        <Route path="/firm-panel" element={<ProtectedRoute element={FirmPanel} />}>
                            {/* /firm-panel'e doğrudan erişilirse, requests'e yönlendir */}
                            <Route index element={<Navigate to="requests" replace />} /> 
                            {/* /firm-panel/requests: Gelen Talepler Listesi */}
                            <Route path="requests" element={<ReferralList />} />
                            {/* /firm-panel/services: Firma Hizmet Yönetimi (YENİ ROTA) */}
                            <Route path="services" element={<FirmServiceList />} />
                            {/* /firm-panel/users: Firma Kullanıcı Yönetimi */}
                            <Route path="users" element={<FirmUserManagement />} />
                        </Route>

                        {/* Korumalı Admin Paneli Rotası */}
                        <Route 
                            path="/admin-panel" 
                            element={<ProtectedRoute element={AdminPanel} mustBeAdmin={true} />} 
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;