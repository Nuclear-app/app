'use client';

import React from 'react';
import { FileSystemComponent, Folder } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FolderIcon, FileIcon, ChevronRight, ChevronDown } from 'lucide-react';

const isFolder = (item: FileSystemComponent): item is Folder => {
    return item instanceof Folder;
};

export interface TreeItemProps {
    item: FileSystemComponent;
    level: number;
    onSelect: (item: FileSystemComponent) => void;
    selectedItem: FileSystemComponent | null;
    expandedFolders: Set<string>;
    onToggleExpand: (folderName: string) => void;
    currentPath: string[];
    onNavigate: (path: string[]) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
    item,
    level,
    onSelect,
    selectedItem,
    expandedFolders,
    onToggleExpand,
    currentPath,
    onNavigate,
}) => {
    const isExpanded = isFolder(item) && expandedFolders.has(item.getName());
    const isSelected = selectedItem?.getName() === item.getName();
    const isInCurrentPath = currentPath.includes(item.getName());

    return (
        <div
            className={`flex items-center py-1.5 px-2 rounded-md transition-colors duration-200
            hover:bg-gray-100/50 cursor-pointer
            ${isSelected ? 'bg-blue-100/50' : ''}
            ${isInCurrentPath ? 'bg-black/50' : ''}`}
            style={{ paddingLeft: `${level * 16}px` }}
            onClick={() => {
                onSelect(item);
                if (isFolder(item)) {
                    const newPath = ['Root'];
                    let currentItem: FileSystemComponent | null = item;
                    const tempPath = [];
                    
                    while (currentItem && currentItem.getName() !== 'Root') {
                        tempPath.unshift(currentItem.getName());
                        currentItem = currentItem.getParent();
                    }
                    onNavigate([...newPath, ...tempPath]);
                }
            }}
        >
            {isFolder(item) ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0.5"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(item.getName());
                    }}
                >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </Button>
            ) : (
                <span className="w-6" />
            )}
            {isFolder(item) ? (
                <FolderIcon size={16} className="mr-2" />
            ) : (
                <FileIcon size={16} className="mr-2" />
            )}
            <span className="text-sm">{item.getName()}</span>
        </div>
    );
};

export default TreeItem;