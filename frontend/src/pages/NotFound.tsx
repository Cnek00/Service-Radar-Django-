// frontend/src/pages/NotFound.tsx

import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle className="w-24 h-24 text-gray-400 mx-auto mb-6" />

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Sayfa Bulunamadı
        </h2>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg"
        >
          <Home className="w-5 h-5" />
          <span>Ana Sayfaya Dön</span>
        </Link>
      </div>
    </div>
  );
}