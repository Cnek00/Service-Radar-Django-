// frontend/src/App.tsx

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Yetkilendirme Servisi
// Yeni hook kullanıldığından burada sadece logout/isAuthenticated kalabilir veya useAuth import edilebilir
import { isAuthenticated, isSuperuser } from './authService'; 
// import { useAuth } from './hooks/useAuth'; // Eğer useAuth hook'unu kullanıyorsanız

// Bileşenler ve Sayfalar
import Header from './components/Header';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register'; // YENİ: Müşteri Kayıt Sayfası
import FirmRegister from './pages/FirmRegister'; // YENİ: Firma Kayıt Sayfası
import FirmPanel from './pages/FirmPanel';
import ReferralList from './pages/ReferralList'; // Firma Paneli Alt Rotası 1
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

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element: Component, mustBeAdmin = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (mustBeAdmin && !isSuperuser()) {
    return <Navigate to="/" replace />; 
  }
  
  // Component'i props alabilmesi için doğru şekilde render et
  return <Component />;
};


// ------------------------------------------------------------------
// ANA UYGULAMA BİLEŞENİ (APP)
// ------------------------------------------------------------------
function App() {
    const [successMessage, setSuccessMessage] = useState<string | null>(null); 

    const handleSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <Router>
            <div className="App min-h-screen flex flex-col">
                
                <Header /> 
                
                {successMessage && (
                    <div className="sticky top-0 z-30 p-3 bg-green-100 text-green-800 text-center font-medium shadow-md">
                        {successMessage}
                    </div>
                )}

                {/* Rota içeriği (flex-grow ile sayfanın kalanını kaplar) */}
                <main className="flex-grow">
                    <Routes>
                        <Route 
                            path="/" 
                            element={<HomePage onSuccess={handleSuccess} />} 
                        /> 
                        
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} /> {/* YENİ: Müşteri Kayıt */}
                        <Route path="/firm-register" element={<FirmRegister />} /> {/* YENİ: Firma Kayıt */}
                        
                        {/* GÜNCEL: Korumalı Firma Paneli ve Alt Rotaları */}
                        {/* FirmPanel artık bir layout/sarıcı görevi görür ve içeriği Outlet ile gösterir. */}
                        <Route path="/firm-panel" element={<ProtectedRoute element={FirmPanel} />}>
                            {/* /firm-panel'e doğrudan erişilirse, requests'e yönlendir */}
                            <Route index element={<Navigate to="requests" replace />} /> 
                            {/* /firm-panel/requests: Gelen Talepler Listesi */}
                            <Route path="requests" element={<ReferralList />} />
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