import React from 'react';

export default function Input({ icon: Icon, isLoading, ...props }: any) {
    return (
        <div className="flex items-center border rounded-md px-3 py-2 bg-white">
            {Icon ? <Icon className="w-4 h-4 mr-2 text-gray-400" /> : null}
            <input className="w-full outline-none" {...props} />
        </div>
    );
}
