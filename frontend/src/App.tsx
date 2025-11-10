// frontend/src/App.tsx

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Yetkilendirme Servisi
import { isAuthenticated } from './authService';

// Bileşenler ve Sayfalar
import Header from './components/Header';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import FirmPanel from './pages/FirmPanel';
import NotFound from './pages/NotFound';

// ------------------------------------------------------------------
// KORUMALI ROTA BİLEŞENİ
// ------------------------------------------------------------------
const ProtectedRoute: React.FC<{ element: React.FC }> = ({ element: Component }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Component />;
};


// ------------------------------------------------------------------
// ANA UYGULAMA BİLEŞENİ (APP)
// ------------------------------------------------------------------
function App() {
    // Global başarı mesajı yönetimi (ReferralForm'dan gelen mesajlar için)
    const [successMessage, setSuccessMessage] = useState<string | null>(null); 

    // Talep gönderimi başarılı olduğunda bu fonksiyon çalışır
    const handleSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <Router>
            <div className="App min-h-screen flex flex-col">
                
                {/* Header (Tüm sayfalarda görünür) */}
                <Header /> 
                
                {/* Başarı mesajını global olarak göster (Sticky olmalı) */}
                {successMessage && (
                    <div className="sticky top-0 z-30 p-3 bg-green-100 text-green-800 text-center font-medium shadow-md">
                        {successMessage}
                    </div>
                )}
                
                {/* Route Tanımları */}
                <div className="flex-grow">
                    <Routes>
                        {/* Müşteri Ana Sayfası (Arama ve Listeleme) */}
                        <Route 
                            path="/" 
                            element={<HomePage onSuccess={handleSuccess} />} 
                        /> 
                        
                        {/* Giriş Rotası */}
                        <Route path="/login" element={<Login />} />
                        
                        {/* Korumalı Firma Paneli Rotası */}
                        <Route 
                            path="/firm-panel" 
                            element={<ProtectedRoute element={FirmPanel} />} 
                        />

                        {/* 404 Sayfası (Tanımlanmamış tüm rotalar) */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;