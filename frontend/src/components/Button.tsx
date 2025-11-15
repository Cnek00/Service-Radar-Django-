import React from 'react';

export default function Button({
    children,
    onClick,
    variant = 'primary',
    icon: Icon,
    isLoading = false,
    disabled = false,
    type = 'button',
    className = '',
    size = 'md',
    ...rest
}: any) {
    const base = 'inline-flex items-center gap-2 rounded-md font-medium focus:outline-none';
    const sizes: any = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    const variants: any = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-white text-gray-700 border hover:bg-gray-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
        info: 'bg-indigo-600 text-white hover:bg-indigo-700',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${base} ${sizes[size]} ${variants[variant] || ''} ${className}`}
            {...rest}
        >
            {isLoading ? '...' : (
                <>
                    {Icon ? <Icon className="w-4 h-4" /> : null}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
}
