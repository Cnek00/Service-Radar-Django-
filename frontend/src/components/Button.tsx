// frontend/src/components/Button.tsx (GÜNCELLENMİŞ ATOMİK BİLEŞEN)

import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// Butonun alabileceği ek stil ve tip seçenekleri
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success'; // Görünüm tipi
    size?: 'sm' | 'md' | 'lg'; // Boyut
    isLoading?: boolean; // Yükleme durumu
    icon?: React.ElementType; // Lucide icon'ı (örn: LogIn, UserPlus)
}

const getVariantClasses = (variant: ButtonProps['variant']): string => {
    switch (variant) {
        case 'secondary':
            // Gri buton (Örn: İptal, Geri)
            return 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300';
        case 'danger':
            // Kırmızı buton (Örn: Çıkış Yap, Sil)
            return 'bg-red-600 text-white hover:bg-red-700';
        case 'success':
            // Yeşil buton (Örn: Kabul Et, Ekle/Oluştur)
            return 'bg-green-600 text-white hover:bg-green-700';
        case 'primary':
        default:
            // Ana (Mavi) buton (Örn: Giriş Yap, Ara)
            return 'bg-blue-600 text-white hover:bg-blue-700';
    }
};

const getSizeClasses = (size: ButtonProps['size']): string => {
    switch (size) {
        case 'sm':
            return 'px-3 py-1 text-sm';
        case 'lg':
            return 'px-8 py-3 text-lg';
        case 'md':
        default:
            return 'px-6 py-3 text-base';
    }
};

const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    icon: Icon,
    className = '', // Mevcut className'leri koru
    disabled,
    ...rest 
}) => {
    // Tüm butonlarda uygulanacak temel sınıflar
    const baseClasses = 'font-semibold rounded-lg transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center';
    
    // Stil sınıflarını birleştir
    const finalClasses = [
        baseClasses,
        getVariantClasses(variant),
        getSizeClasses(size),
        className, // Kullanıcıdan gelen ekstra sınıfları ekle
    ].join(' ');

    return (
        <button
            // Default type'ı 'button' olarak ayarladık, form gönderimi için 'submit' olarak ezilebilir.
            type="button" 
            className={finalClasses}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading ? (
                // Yükleniyorsa Loader ikonunu göster
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : Icon ? (
                // İkon varsa İkonu göster
                <Icon className={`w-5 h-5 ${children ? 'mr-2' : ''}`} />
            ) : null}
            
            {/* Çocuk bileşenleri göster (Buton yazısı) */}
            {children}
        </button>
    );
};

export default Button;