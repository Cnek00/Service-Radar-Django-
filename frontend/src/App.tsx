// frontend/src/App.tsx

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Yetkilendirme Servisi
import { isAuthenticated, isSuperuser } from './authService'; 

// Bileşenler ve Sayfalar
import Header from './components/Header';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import FirmPanel from './pages/FirmPanel';
import AdminPanel from './pages/AdminPanel'; 
import NotFound from './pages/NotFound';
// Yeni Sayfalar:
import ReferralList from './pages/ReferralList';
import FirmUserManagement from './pages/FirmUserManagement';


// ------------------------------------------------------------------
// KORUMALI ROTA BİLEŞENİ
// ------------------------------------------------------------------

interface ProtectedRouteProps {
    element: React.FC;
    // Rota sadece Adminler içinse bu prop'u kullanacağız
    mustBeAdmin?: boolean; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element: Component, mustBeAdmin = false }) => {
  // 1. Temel giriş kontrolü
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // 2. Admin kontrolü isteniyorsa ve kullanıcı Admin değilse
  if (mustBeAdmin && !isSuperuser()) {
    // Yetki yoksa ana sayfaya yönlendir (veya 403 sayfasına)
    return <Navigate to="/" replace />; 
  }
  
  return <Component />;
};


// ------------------------------------------------------------------
// ANA UYGULAMA BİLEŞENİ
// ------------------------------------------------------------------

function App() {
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
                
                {successMessage && (
                    <div className="sticky top-0 z-30 p-3 bg-green-100 text-green-800 text-center font-medium shadow-md">
                        {successMessage}
                    </div>
                )}

                <main className="flex-grow">
                    <Routes>
                        <Route 
                            path="/" 
                            element={<HomePage onSuccess={handleSuccess} />} 
                        /> 
                        
                        <Route path="/login" element={<Login />} />
                        
                        {/* FİRMA PANELİ VE ALT ROTOLARI (NESTED ROUTES) */}
                        {/* FirmPanel'in kendisi ProtectedRoute ile korunur */}
                        <Route path="/firm-panel" element={<ProtectedRoute element={FirmPanel} />}>
                            {/* /firm-panel'e doğrudan erişilirse, /firm-panel/requests'e yönlendir */}
                            <Route index element={<Navigate to="requests" replace />} /> 
                            
                            {/* /firm-panel/requests: Gelen Talepler Listesi */}
                            <Route path="requests" element={<ReferralList />} />
                            
                            {/* /firm-panel/users: Firma Kullanıcı Yönetimi */}
                            <Route path="users" element={<FirmUserManagement />} />
                        </Route>
                        {/* ------------------------------------- */}
                        
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