'use client';

import React, { useState } from 'react';
import { FileSystemNode, Folder, Block, isFolder, isBlock } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderIcon, FileIcon, ChevronRight, ChevronDown, Plus } from 'lucide-react';

interface TreeItemProps {
  item: FileSystemNode;
  level: number;
  onSelect: (item: FileSystemNode) => void;
  selectedItem: FileSystemNode | null;
  expandedFolders: Set<string>;
  onToggleExpand: (folderId: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  level,
  onSelect,
  selectedItem,
  expandedFolders,
  onToggleExpand,
}) => {
  const isExpanded = isFolder(item) && expandedFolders.has(item.id);
  const isSelected = selectedItem?.id === item.id;

  return (
    <div
      className={`flex items-center p-1 cursor-pointer hover:bg-gray-100 ${
        isSelected ? 'bg-blue-100' : ''
      }`}
      style={{ paddingLeft: `${level * 16}px` }}
      onClick={() => onSelect(item)}
    >
      {isFolder(item) ? (
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id);
          }}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      ) : (
        <span className="w-[24px]" />
      )}
      {isFolder(item) ? <FolderIcon size={16} className="mr-2" /> : <FileIcon size={16} className="mr-2" />}
      <span>{item.name}</span>
    </div>
  );
};

export default function FileSystem() {
  // Root folder structure
  const [root, setRoot] = useState<Folder>({
    id: 'root',
    name: 'Root',
    type: 'folder',
    children: [],
  });

  const [selectedItem, setSelectedItem] = useState<FileSystemNode | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [newItemName, setNewItemName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newItemType, setNewItemType] = useState<'folder' | 'block'>('folder');

  const handleToggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const createNewNode = (name: string, type: 'folder' | 'block'): FileSystemNode => {
    const id = Math.random().toString(36).substr(2, 9);
    if (type === 'folder') {
      return {
        id,
        name,
        type: 'folder',
        children: [],
      } as Folder;
    } else {
      return {
        id,
        name,
        type: 'block',
        content: '',
        contentType: 'text',
      } as Block;
    }
  };

  const addNodeToFolder = (parentFolder: Folder, newNode: FileSystemNode): Folder => {
    return {
      ...parentFolder,
      children: [...parentFolder.children, newNode],
    };
  };

  const updateFolderInTree = (folder: Folder, targetId: string, updater: (f: Folder) => Folder): Folder => {
    if (folder.id === targetId) {
      return updater(folder);
    }

    return {
      ...folder,
      children: folder.children.map((child) =>
        isFolder(child) ? updateFolderInTree(child, targetId, updater) : child
      ),
    };
  };

  const handleCreateNew = () => {
    if (!newItemName) return;

    const newNode = createNewNode(newItemName, newItemType);
    
    if (!selectedItem || !isFolder(selectedItem)) {
      // Add to root if no folder is selected
      setRoot((prev) => addNodeToFolder(prev, newNode));
    } else {
      // Add to selected folder
      setRoot((prev) => updateFolderInTree(prev, selectedItem.id, (folder) => addNodeToFolder(folder, newNode)));
    }

    setNewItemName('');
    setIsCreatingNew(false);
  };

  const renderTree = (node: FileSystemNode, level: number = 0): React.ReactNode => {
    const children = isFolder(node) && expandedFolders.has(node.id)
      ? node.children.map((child) => renderTree(child, level + 1))
      : null;

    return (
      <React.Fragment key={node.id}>
        <TreeItem
          item={node}
          level={level}
          onSelect={setSelectedItem}
          selectedItem={selectedItem}
          expandedFolders={expandedFolders}
          onToggleExpand={handleToggleExpand}
        />
        {children}
      </React.Fragment>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsCreatingNew(true);
            setNewItemType('folder');
          }}
        >
          <Plus size={16} className="mr-1" /> New Folder
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsCreatingNew(true);
            setNewItemType('block');
          }}
        >
          <Plus size={16} className="mr-1" /> New Block
        </Button>
      </div>

      {isCreatingNew && (
        <div className="flex items-center gap-2 p-2 border-b">
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

      <div className="flex-1 overflow-auto">
        {renderTree(root)}
      </div>
    </div>
  );
} 