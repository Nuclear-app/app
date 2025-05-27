'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchFileSystemStructure, addBlock, addFolder } from '@/app/dashboardTest/actions';
import { DatabaseItem } from '@/app/dashboardTest/actions';

interface DisplayItem {
    id: string;
    name: string;
    type: 'block' | 'crate';
}

export default function DashApp() {
    const [items, setItems] = useState<DisplayItem[]>([]);
    const [newItemName, setNewItemName] = useState('');

    // Load items from database on mount
    useEffect(() => {
        const loadItems = async () => {
            try {
                const structure = await fetchFileSystemStructure();
                // Convert database items to display format
                const displayItems: DisplayItem[] = structure
                    .filter(item => item.parent === null) // Only root level items
                    .map(item => ({
                        id: item.id,
                        name: item.type === 'block' ? item.name : item.name,
                        type: item.type === 'block' ? 'block' : 'crate'
                    }));
                setItems(displayItems);
            } catch (error) {
                console.error('Failed to load items:', error);
            }
        };
        loadItems();
    }, []);

    const createItem = async (type: 'block' | 'crate') => {
        if (!newItemName.trim()) return;

        try {
            let newItem;
            if (type === 'block') {
                newItem = await addBlock(newItemName, null);
            } else {
                newItem = await addFolder(newItemName, null);
            }

            const displayItem: DisplayItem = {
                id: newItem.id,
                name: newItemName,
                type
            };

            setItems(prev => [...prev, displayItem]);
            setNewItemName('');
        } catch (error) {
            console.error(`Failed to create ${type}:`, error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Root Directory</h1>
            
            <div className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter name..."
                    className="border p-2 rounded flex-grow"
                />
                <button 
                    onClick={() => createItem('block')}
                    className="border px-4 py-2 rounded hover:bg-gray-50"
                >
                    Create Block
                </button>
                <button 
                    onClick={() => createItem('crate')}
                    className="border px-4 py-2 rounded hover:bg-gray-50"
                >
                    Create Crate
                </button>
            </div>

            <div className="grid gap-4">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`/dashApp/${item.type}/${item.id}`}
                        className="block p-4 border rounded hover:bg-gray-50 transition-colors"
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