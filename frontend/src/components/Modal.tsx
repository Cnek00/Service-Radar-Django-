// frontend/src/components/Modal.tsx

import React, { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean; // Modal açık mı?
    onClose: () => void; // Kapatma fonksiyonu
    title: string; // Modal başlığı
    children: ReactNode; // Modal içeriği
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null; // Açık değilse hiçbir şey render etme

    return (
        <div 
            // Arka planı (overlay) - Kapatma işlevi için tıklamayı algılar
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" 
            onClick={onClose} 
        >
            <div 
                // Modal içeriği: Max genişlik ve padding ayarları
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 transform transition-all duration-300 scale-100 opacity-100" 
                onClick={(e) => e.stopPropagation()} // İçeriğe tıklayınca modalın kapanmasını engeller
            >
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {/* İçerik alanı, dikey kaydırmaya izin verir */}
                <div className="pt-4 max-h-[80vh] overflow-y-auto"> 
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;