import { FileSystemComponent, Folder, Block } from '@/lib/types';
import React from 'react';
import TreeItem from '@/components/dashboardComp/treeItem';


interface CreateItemParams {
    itemName: string;
    itemType: 'folder' | 'block';
    selectedItem: FileSystemComponent | null;
    rootFolder: Folder;
}

export const toggleFolderExpansion = (
    folderName: string,
    currentExpandedFolders: Set<string>
): Set<string> => {
    const updatedFolders = new Set(currentExpandedFolders);
    
    if (updatedFolders.has(folderName)) {
        updatedFolders.delete(folderName);
    } else {
        updatedFolders.add(folderName);
    }
    
    return updatedFolders;
};

export const createItem = ({ itemName, itemType, selectedItem, rootFolder }: CreateItemParams) => {
    const newNode: FileSystemComponent = itemType === 'folder'
        ? new Folder(itemName)
        : new Block(itemName, 0);

    if (!selectedItem || !(selectedItem instanceof Folder)) {
        rootFolder.add(newNode);
    } else {
        (selectedItem as Folder).add(newNode);
    }
}

export const createFileSystemItem = ({
    itemName,
    itemType,
    selectedItem,
    rootFolder
}: CreateItemParams): boolean => {
    if (!itemName) return false;

    const newNode: FileSystemComponent = itemType === 'folder'
        ? new Folder(itemName)
        : new Block(itemName, 0);

    if (!selectedItem || !(selectedItem instanceof Folder)) {
        rootFolder.add(newNode);
    } 
    else {
        (selectedItem as Folder).add(newNode);
    }

    return true;
};
