'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import FileSystem from '@/components/fileStructure/fileSystem';
import { addBlock, addFolder, getRootFolder, fetchFileSystemStructure, DatabaseItem } from './actions';
import { FileSystemItem } from '@/components/fileStructure/fileSystem';
import { useSearchParams } from 'next/navigation';

interface ExistingItems {
    [key: string]: {
        id: string;
        type: 'block' | 'folder';
        parent: string | null;
    }
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const [existingItems, setExistingItems] = useState<ExistingItems>({});
    const [initialData, setInitialData] = useState<DatabaseItem[] | undefined>();
    const processingRef = useRef(false);

    useEffect(() => {
        const initializeFileSystem = async () => {
            try {
                // Fetch entire file system structure
                const structure = await fetchFileSystemStructure();
                setInitialData(structure);

                // Update existing items with all fetched items
                const items: ExistingItems = {};
                structure.forEach(item => {
                    items[item.name] = {
                        id: item.id,
                        type: item.type,
                        parent: item.parent
                    };
                });
                setExistingItems(items);
            } catch (error) {
                console.error("Failed to initialize file system:", error);
            }
        };
        initializeFileSystem();
    }, []);

    const getParentId = (parentName: string | null): string | null => {
        if (!parentName) return null;
        return existingItems[parentName]?.id || null;
    };

    const handleStructureChange = async (newItems: FileSystemItem[]) => {
        if (processingRef.current) {
            console.log('Already processing a structure change, skipping...');
            return;
        }

        try {
            processingRef.current = true;

            // Process each new item
            for (const item of newItems) {
                try {
                    if (item.type === 'block') {
                        const parentId = getParentId(item.parent);
                        const newBlock = await addBlock(item.name, parentId);
                        existingItems[item.name] = {
                            id: newBlock.id,
                            type: 'block',
                            parent: item.parent
                        };
                    } else {
                        const parentId = getParentId(item.parent);
                        const newFolder = await addFolder(item.name, parentId);
                        existingItems[item.name] = {
                            id: newFolder.id,
                            type: 'folder',
                            parent: item.parent
                        };
                    }
                } catch (error) {
                    console.error(`Failed to create ${item.type}:`, error);
                }
            }

            setExistingItems({...existingItems});

        } catch (error) {
            console.error("Failed to update structure:", error);
        } finally {
            processingRef.current = false;
        }
    };

    return (
        <div className="flex min-h-screen">
            <div className="w-1/3 p-4 border-r">
                <FileSystem 
                    returnStructure={handleStructureChange}
                    initialData={initialData}
                />
            </div>
        </div>
    );
}

export default function DashboardTest() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
} 
