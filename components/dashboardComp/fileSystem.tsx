'use client';

import React, { useState, useEffect } from 'react';
import TreeItem from './treeItem';
import { FileSystemComponent, Folder, Block } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import NavigationHeader from './navigationHeader';
import ActionButtons from './actionButtons';
import CreateItemForm from './createItemForm';
import FileSystemTree from './fileSystemTree';

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