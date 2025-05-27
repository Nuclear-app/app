'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { fetchFileSystemStructure, addBlock, addCrate, DatabaseItem, Block, Folder } from '@/app/dashboard/actions';

interface DisplayItem {
    id: string;
    name: string;
    type: 'block' | 'crate';
}

export default function CratePage() {
    const params = useParams();
    const crateId = params.id as string;
    const [items, setItems] = useState<DisplayItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemType, setNewItemType] = useState<'block' | 'crate'>('block');
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const loadItems = async () => {
            try {
                const structure = await fetchFileSystemStructure();
                // Convert database items to display format, filtering for items in this crate
                const displayItems: DisplayItem[] = structure
                    .filter(item => item.parent === crateId)
                    .map(item => ({
                        id: item.id,
                        name: item.name,
                        type: item.type === 'block' ? 'block' : 'crate'
                    }));
                setItems(displayItems);
            } catch (error) {
                console.error('Failed to load items:', error);
            }
        };
        loadItems();
    }, [crateId]);

    const handleCreateItem = async () => {
        if (!newItemName.trim()) return;

        try {
            let newItem: Block | Folder;
            if (newItemType === 'block') {
                newItem = await addBlock(newItemName, crateId);
                setItems(prev => [...prev, { id: newItem.id, name: (newItem as Block).title, type: 'block' }]);
            } else {
                newItem = await addCrate(newItemName, crateId);
                setItems(prev => [...prev, { id: newItem.id, name: (newItem as Folder).name, type: 'crate' }]);
            }
            setNewItemName('');
            setDialogOpen(false);
        } catch (error) {
            console.error(`Failed to create ${newItemType}:`, error);
        }
    };

    return (
        <div className="container h-5/6 grid grid-rows-8 grid-cols-3 gap-4">
            <div className="col-span-2 row-span-1 rounded-xl bg-[#161616] border-2 border-nuclear p-4 font-black text-3xl flex items-center">
                <Link href="/dashboard" className="hover:opacity-80">← Back to Dashboard</Link>
            </div>
            <div className="col-span-2 row-span-7 bg-[#161616] rounded-xl border-2 p-4">
                <h1 className="text-2xl font-black mb-6">Crate View</h1>
                
                <div className="mb-6 flex gap-4">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <div className="bg-[#292929] rounded-xl border-2 p-4 flex items-center justify-center hover:bg-[#333333] cursor-pointer transition-colors aspect-square">
                                <Plus className="w-6 h-6" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="bg-[#161616] border-2">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Create New Item</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Choose a type and enter a name for your new item.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setNewItemType('block')}
                                            className={`flex-1 ${newItemType === 'block' ? 'bg-[#333333]' : 'bg-[#292929]'}`}
                                        >
                                            Block
                                        </Button>
                                        <Button
                                            onClick={() => setNewItemType('crate')}
                                            className={`flex-1 ${newItemType === 'crate' ? 'bg-[#333333]' : 'bg-[#292929]'}`}
                                        >
                                            Crate
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="itemName" className="text-sm font-medium">Name</label>
                                    <input
                                        id="itemName"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        className="bg-[#292929] border rounded-md p-2"
                                    />
                                </div>
                                <Button onClick={handleCreateItem}>Create {newItemType}</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-9 gap-4">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            href={`/dashboard/${item.type}/${item.id}`}
                            className="bg-[#292929] rounded-xl border-2 p-4 hover:bg-[#333333] aspect-square flex items-center justify-center"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm text-center">{item.name}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
} 