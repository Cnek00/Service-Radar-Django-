import React from 'react';

export default function Modal({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Kapat</button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
