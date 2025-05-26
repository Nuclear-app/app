'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Item {
    id: string;
    name: string;
    type: 'block' | 'crate';
}

export default async function CratePage({ params }: { params: { id: string } }) {
    const [items, setItems] = useState<Item[]>([]);
    const [newItemName, setNewItemName] = useState('');

    // Load items from localStorage on mount
    useEffect(() => {
        const savedItems = localStorage.getItem(`crate-${params.id}`);
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
    }, [params.id]);

    const createItem = (type: 'block' | 'crate') => {
        const newItem: Item = {
            id: Math.random().toString(36).substr(2, 9),
            name: newItemName,
            type
        };
        const updatedItems = [...items, newItem];
        setItems(updatedItems);
        // Save to localStorage with crate-specific key
        localStorage.setItem(`crate-${params.id}`, JSON.stringify(updatedItems));
        setNewItemName('');
    };

    return (
        <div className="p-6">
            <div className="mb-4">
                <Link 
                    href="/appFinal/dashboard/root"
                >
                    ← Back to Root
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-6">Crate: {params.id}</h1>
            
            <div className="mb-6">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter name..."
                    className="border p-2 mr-2 rounded"
                />
                <button
                    onClick={() => createItem('block')}
                >
                    Create Block
                </button>
                <button
                    onClick={() => createItem('crate')}
                >
                    Create Crate
                </button>
            </div>

            <div className="grid gap-4">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`/appFinal/dashboard/${item.type}/${item.id}`}
                        className="block p-4 border rounded hover:bg-gray-50"
                    >
                        <div className="flex items-center">
                            <span className="mr-2">
                                {item.type === 'block' ? '📄' : '📁'}
                            </span>
                            <span>{item.name}</span>
                            <span className="ml-2 text-gray-500">({item.type})</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
} 