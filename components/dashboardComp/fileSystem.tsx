'use client';

import React, { useState, useEffect } from 'react';
import TreeItem from './treeItem';
import { FileSystemComponent, Folder, Block } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function FileSystem() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [root] = useState(() => new Folder('Root'));
    const [selectedItem, setSelectedItem] = useState<FileSystemComponent | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['Root']));
    const [newItemName, setNewItemName] = useState('');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newItemType, setNewItemType] = useState<'folder' | 'block'>('folder');
    const [currentPath, setCurrentPath] = useState<string[]>(['Root']);

    useEffect(() => {
        const path = searchParams.get('path');
        if (path) {
            const decodedPath = decodeURIComponent(path).split('/');
            setCurrentPath(['Root', ...decodedPath.filter(Boolean)]);
            const pathSet = new Set(['Root', ...decodedPath.filter(Boolean)]);
            setExpandedFolders(pathSet);
        }
    }, [searchParams]);

    const updatePath = (newPath: string[]) => {
        setCurrentPath(newPath);
        const pathParam = newPath.slice(1).join('/');
        const newSearchParams = new URLSearchParams(searchParams);
        if (pathParam) {
            newSearchParams.set('path', pathParam);
        } else {
            newSearchParams.delete('path');
        }
        router.push(`?${newSearchParams.toString()}`);
    };

    const handleToggleExpand = (folderName: string) => {
        setExpandedFolders((prev: Set<string>) => {
            const next = new Set(prev);
            if (next.has(folderName)) {
                next.delete(folderName);
            } else {
                next.add(folderName);
            }
            return next;
        });
    };

    const handleCreateNew = () => {
        if (!newItemName) return;
        
        const newNode: FileSystemComponent = newItemType === 'folder'
            ? new Folder(newItemName)
            : new Block(newItemName, 0);

        if (!selectedItem || !(selectedItem instanceof Folder)) {
            root.add(newNode);
        } else {
            (selectedItem as Folder).add(newNode);
        }

        setNewItemName('');
        setIsCreatingNew(false);
    };

    const renderTree = (node: FileSystemComponent, level: number = 0): React.ReactNode => {
        const children = node instanceof Folder && expandedFolders.has(node.getName())
            ? node.getChildren().map((child) => renderTree(child, level + 1))
            : null;

        return (
            <React.Fragment key={node.getName()}>
                <TreeItem
                    item={node}
                    level={level}
                    onSelect={setSelectedItem}
                    selectedItem={selectedItem}
                    expandedFolders={expandedFolders}
                    onToggleExpand={handleToggleExpand}
                    currentPath={currentPath}
                    onNavigate={updatePath}
                />
                {children}
            </React.Fragment>
        );
    };

    const handleNavigateUp = () => {
        if (currentPath.length > 1) {
            updatePath(currentPath.slice(0, -1));
        }
    };

    return (
        <div className="h-full flex flex-col border rounded-lg shadow-sm">
            <div className="flex items-center gap-2 p-2 border-b rounded-t-lg">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleNavigateUp}
                    disabled={currentPath.length <= 1}
                >
                    <ChevronLeft size={16} />
                </Button>
                <Breadcrumb>
                    <BreadcrumbList>
                        {currentPath.map((pathItem, index) => (
                            <React.Fragment key={pathItem}>
                                <BreadcrumbItem>
                                    {index === currentPath.length - 1 ? (
                                        <BreadcrumbPage>{pathItem}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink
                                            onClick={() => updatePath(currentPath.slice(0, index + 1))}
                                            className="cursor-pointer"
                                        >
                                            {pathItem}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {index < currentPath.length - 1 && <BreadcrumbSeparator />}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-2 p-2 border-b">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setIsCreatingNew(true);
                        setNewItemType('folder');
                    }}
                >
                    <Plus size={16} className="mr-1.5" />
                    New Folder
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setIsCreatingNew(true);
                        setNewItemType('block');
                    }}
                >
                    <Plus size={16} className="mr-1.5" />
                    New Block
                </Button>
            </div>

            {isCreatingNew && (
                <div className="flex items-center gap-2 p-2 border-b bg-gray-50/50">
                    <Input
                        className="h-8"
                        placeholder={`Enter ${newItemType} name...`}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleCreateNew();
                            } else if (e.key === 'Escape') {
                                setIsCreatingNew(false);
                                setNewItemName('');
                            }
                        }}
                        autoFocus
                    />
                    <Button size="sm" onClick={handleCreateNew}>
                        Create
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsCreatingNew(false)}>
                        Cancel
                    </Button>
                </div>
            )}

            <div className="flex-1 overflow-auto p-2">
                {renderTree(root)}
            </div>
        </div>
    );
}