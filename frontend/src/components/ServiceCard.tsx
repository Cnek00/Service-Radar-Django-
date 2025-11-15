import { Link } from 'react-router-dom';

export default function ServiceCard({ service, onClick, className = '' }: any) {
    return (
        <Link to={`/service/${service.id}`}>
            <div onClick={() => onClick && onClick(service)} className={`p-4 hover:bg-blue-50 transition-colors ${className}`}>
                <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">{service.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                <div className="mt-2 text-sm font-medium text-gray-700">
                    💰 {service.price_range_min} - {service.price_range_max} TL
                </div>
                {service.category && (
                    <div className="mt-2">
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                            {service.category.name || service.category}
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
}
