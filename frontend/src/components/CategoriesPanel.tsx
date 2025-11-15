import { useEffect, useState } from 'react';
import type { ICategory } from '../types';

interface Props {
    onSelect?: (category: string | null) => void;
}

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function CategoriesPanel({ onSelect }: Props) {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [active, setActive] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/core/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data || []);
                }
            } catch (e) {
                console.error('Failed to load categories', e);
            }
        })();
    }, []);

    const handleClick = (slug?: string) => {
        const val = slug ?? null;
        setActive(val);
        onSelect && onSelect(val);
    };

    return (
        <div className="w-full max-w-7xl mx-auto mb-6">
            <div className="flex gap-3 overflow-x-auto py-2">
                <button
                    onClick={() => handleClick(undefined)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${active === null ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700'
                        }`}
                >
                    Tüm Kategoriler
                </button>
                {categories.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => handleClick(c.slug)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${active === c.slug ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700'
                            }`}
                    >
                        {c.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
