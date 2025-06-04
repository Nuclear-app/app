'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Item {
    id: string;
    name: string;
    type: 'block' | 'crate';
}

type Params = Promise<{ slug: string[] }>

export default function CratePage({ params }: { params: Params }) {
    const [items, setItems] = useState<Item[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [crateId, setCrateId] = useState('');

    // Resolve params and load items from localStorage
    useEffect(() => {
        const loadData = async () => {
            const { slug } = await params;
            const id = slug[0];
            setCrateId(id);
            
            const savedItems = localStorage.getItem(`crate-${id}`);
            if (savedItems) {
                setItems(JSON.parse(savedItems));
            }
        };
        loadData();
    }, [params]);

    const createItem = (type: 'block' | 'crate') => {
        const newItem: Item = {
            id: Math.random().toString(36).substr(2, 9),
            name: newItemName,
            type
        };
        const updatedItems = [...items, newItem];
        setItems(updatedItems);
        // Save to localStorage with crate-specific key
        localStorage.setItem(`crate-${crateId}`, JSON.stringify(updatedItems));
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
            <h1 className="text-2xl font-bold mb-6">Crate: {crateId}</h1>
            
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