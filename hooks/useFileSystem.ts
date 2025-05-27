import { useState, useEffect } from 'react';
import { Folder, Block, TreeResponse } from '@/lib/types';

interface UseFileSystemReturn {
  folders: Folder[];
  blocks: Block[];
  loading: boolean;
  error: string | null;
  createFolder: (name: string, parentId: string | null) => Promise<void>;
  createBlock: (name: string, parentId: string, content?: string, contentType?: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFileSystem(): UseFileSystemReturn {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFileSystem = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/filesystem');
      const data: TreeResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setFolders(data.folders);
      setBlocks(data.blocks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch file system');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileSystem();
  }, []);

  const createFolder = async (name: string, parentId: string | null) => {
    try {
      const response = await fetch('/api/filesystem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'folder',
          name,
          parent_id: parentId,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setFolders(prev => [...prev, data.folder]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
      throw err;
    }
  };

  const createBlock = async (
    name: string,
    parentId: string,
    content: string = '',
    contentType: string = 'text'
  ) => {
    try {
      const response = await fetch('/api/filesystem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'block',
          name,
          parent_id: parentId,
          content,
          content_type: contentType,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setBlocks(prev => [...prev, data.block]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create block');
      throw err;
    }
  };

  return {
    folders,
    blocks,
    loading,
    error,
    createFolder,
    createBlock,
    refresh: fetchFileSystem,
  };
} 