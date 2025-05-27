'use client';

import React, { useState, useEffect } from 'react';
import TreeItem from './treeItem';
import { FileSystemComponent, Folder, Block } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import NavigationHeader from './navigationHeader';
import ActionButtons from './actionButtons';
import CreateItemForm from './createItemForm';
import FileSystemTree from './fileSystemTree';
import { DatabaseItem } from '@/app/testPages/dashboardTest/actions';

const rootFolderId = "58b06f68-4d5b-4eef-8a5a-8f83de7a0aba";

export interface FileSystemItem {
    name: string;
    type: 'block' | 'folder';
    parent: string | null;
}

interface FileSystemProps {
    returnStructure?: (structure: FileSystemItem[]) => void;
    initialData?: DatabaseItem[];
}

export default function FileSystem({ returnStructure, initialData }: FileSystemProps = {}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [root, setRoot] = useState(() => new Folder('Root'));
    const [selectedItem, setSelectedItem] = useState<FileSystemComponent | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['Root']));
    const [newItemName, setNewItemName] = useState('');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newItemType, setNewItemType] = useState<'folder' | 'block'>('folder');
    const [currentPath, setCurrentPath] = useState<string[]>(['Root']);
    const [itemsMap] = useState(() => new Map<string, FileSystemComponent>());

    // Initialize file system with data from database
    useEffect(() => {
        if (!initialData) return;

        const newRoot = new Folder('Root');
        itemsMap.clear();
        itemsMap.set(rootFolderId, newRoot);

        // First pass: create all items
        initialData.forEach(item => {
            if (item.id === rootFolderId) return; // Skip root, we already created it
            
            const component = item.type === 'folder' 
                ? new Folder(item.name)
                : new Block(item.name, 0);
            itemsMap.set(item.id, component);
        });

        // Second pass: establish parent-child relationships
        initialData.forEach(item => {
            if (item.id === rootFolderId) return; // Skip root
            
            const child = itemsMap.get(item.id);
            if (!child) return;

            const parent = item.parent ? itemsMap.get(item.parent) : newRoot;
            if (parent instanceof Folder) {
                parent.add(child);
            }
        });

        setRoot(newRoot);
    }, [initialData]);

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

        // Only notify about the new item
        if (returnStructure) {
            returnStructure([{
                name: newNode.getName(),
                type: newItemType,
                parent: newNode.getParent()?.getName() || null
            }]);
        }

        setNewItemName('');
        setIsCreatingNew(false);
    };

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
          <NavigationHeader
            currentPath={currentPath}
            handleNavigateUp={handleNavigateUp}
            updatePath={updatePath}
          />
          <ActionButtons
            setIsCreatingNew={setIsCreatingNew}
            setNewItemType={setNewItemType}
          />
          <CreateItemForm
            isCreatingNew={isCreatingNew}
            newItemType={newItemType}
            newItemName={newItemName}
            setNewItemName={setNewItemName}
            handleCreateNew={handleCreateNew}
            setIsCreatingNew={setIsCreatingNew}
          />
          <FileSystemTree root={root} renderTree={renderTree} />
        </div>
      );
}