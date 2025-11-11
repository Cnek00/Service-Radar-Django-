// frontend/src/components/Input.tsx (YENİ ATOMİK BİLEŞEN)

import React, { 
    type InputHTMLAttributes, 
    type TextareaHTMLAttributes, 
    type ReactNode 
} from 'react';
import { AlertCircle } from 'lucide-react';

// Ortak Props'lar
interface BaseInputProps {
    // Lucide ikonunu eklemek için (örn: User, Mail, Key)
    icon?: React.ElementType; 
    // Hata mesajı varsa, alt kısımda gösterilir ve input rengini değiştirir
    error?: string; 
    // Yükleniyor durumunda input'u devre dışı bırakır
    isLoading?: boolean; 
    // Tailwind'den gelen ekstra sınıfları kabul eder
    className?: string; 
    // Input'un altındaki küçük açıklama metni
    helperText?: ReactNode; 
}

// 1. Standart Input (text, email, password vb.)
interface StandardInputProps extends InputHTMLAttributes<HTMLInputElement>, BaseInputProps {
    as?: 'input'; // Tipi belirtmek için opsiyonel
}

// 2. Textarea (çok satırlı metin)
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {
    as: 'textarea';
}

// Birleşik InputProps tipi: Ya standart input ya da textarea
type InputProps = StandardInputProps | TextareaProps;

// Ana stil sınıfları
const baseClasses = "w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed";
const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500 pr-10";
const defaultClasses = "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
const iconPaddingClasses = "pl-10"; // İkon varsa sola eklenen padding

const Input: React.FC<InputProps> = ({ 
    icon: Icon, 
    error, 
    isLoading, 
    className = '', 
    helperText,
    as = 'input', // Default olarak input
    ...rest 
}) => {
    // Stil sınıflarını belirle
    const finalInputClasses = [
        baseClasses,
        error ? errorClasses : defaultClasses,
        Icon && as === 'input' ? iconPaddingClasses : 'pl-4', // Textarea'da ikona gerek yok
        className, // Kullanıcıdan gelen ekstra sınıflar
    ].join(' ');

    const disabled = isLoading || rest.disabled;

    // Input veya Textarea komponentini seç
    const Element = as === 'textarea' ? 'textarea' : 'input';

    return (
        <div className="relative">
            {/* 1. İkon (sadece input ise gösterilir) */}
            {Icon && as === 'input' && (
                <Icon 
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 
                                ${error ? 'text-red-500' : 'text-gray-400'}`} 
                />
            )}
            
            {/* 2. Ana Input/Textarea Elemanı */}
            <Element
                className={finalInputClasses}
                disabled={disabled}
                {...(rest as any)} // Genişletilmiş props'ları aktar (tip güvenliği için `as any` kullandık)
            />

            {/* 3. Hata İkonu (sadece input ve hata varsa gösterilir) */}
            {error && as === 'input' && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500 pointer-events-none" />
            )}

            {/* 4. Hata/Açıklama Metni */}
            {(error || helperText) && (
                <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default Input;