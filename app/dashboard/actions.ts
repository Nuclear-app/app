"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Mode } from "@prisma/client";
import { getUserById, getUserCrates, getUserName } from "@/lib/user";
import { getUserFolders, getUserPosts } from "@/lib/user";
import { createFolder, deleteFolder, getFolderById, getTopLevelFolders } from "@/lib/folder";
import { createBlock, getTopLevelBlocks, getBlockById, setBlockTitle, deleteBlock as removeBlock } from "@/lib/block";
import { 
  getUserBlocksWithCache, 
  getUserFoldersWithCache, 
  getTopLevelBlocksWithCache, 
  getTopLevelFoldersWithCache,
  getDashboardItemsWithCache,
  getFileSystemStructureWithCache,
  getUserNameWithCache,
  getFolderWithCache,
  invalidateUserCache,
  invalidateBlockCache,
  invalidateFolderCache
} from "@/lib/redis";

const ROOT_FOLDER_ID = process.env.ROOT_FOLDER_ID || "f2120a35-5e3f-488e-be86-f0753af42e77";

export interface DatabaseItem {
    id: string;
    name: string;
    type: 'block' | 'folder';
    parent: string | null;
}

export interface Block {
    id: string;
    title: string;
    createdAt: Date;
}

export interface Folder {
    id: string;
    name: string;
    icon: string | null;
    createdAt: Date;
}

export interface CratePath {
    id: string;
    name: string;
}

export async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
}

// Single-purpose query methods
export const fetchUserBlocks = async () => {
    const userId = await getUser();
    return await getUserBlocksWithCache(userId || "");
};

export const fetchUserFolders = async () => {
    const userId = await getUser();
    console.log('fetchUserFolders - Fetching for user:', userId);
    
    const userFolders = await getUserFoldersWithCache(userId || "");
    console.log('fetchUserFolders - Folders data:', JSON.stringify(userFolders, null, 2));
    return userFolders;
};

export const fetchRootBlocks = async () => {
    const userId = await getUser();
    return await getTopLevelBlocksWithCache(userId || "", ROOT_FOLDER_ID);
};

export const fetchRootFolders = async () => {
    const userId = await getUser();
    return await getTopLevelFoldersWithCache(userId || "", ROOT_FOLDER_ID);
};

// Composite methods that use single-purpose queries
export const fetchDashboardItems = async () => {
    try {
        const userId = await getUser();
        console.log('fetchDashboardItems - Fetching for user:', userId);

        const userData = await getDashboardItemsWithCache(userId || "");

        const result = {
            blocks: (userData as any)?.posts?.map((block: any) => ({
                id: block.id,
                title: block.title,
                createdAt: block.createdAt,
                folderId: block.folderId
            })) || [],
            folders: (userData as any)?.folders?.map((folder: any) => ({
                id: folder.id,
                name: folder.name,
                icon: folder.icon,
                createdAt: folder.createdAt,
                parentId: folder.parentId
            })) || []
        };

        return result;
    } catch (error) {
        console.error("Failed to fetch dashboard items:", error);
        throw error;
    }
};

export const fetchRootItems = async () => {
    try {
        const [blocks, folders] = await Promise.all([
            fetchRootBlocks(),
            fetchRootFolders()
        ]);

        return { blocks, folders };
    } catch (error) {
        console.error("Failed to fetch root items:", error);
        throw error;
    }
};

export const fetchFileSystemStructure = async (): Promise<DatabaseItem[]> => {
    try {
        const userId = await getUser();
        const { blocks, folders } = await getFileSystemStructureWithCache(userId || "");

        const structure: DatabaseItem[] = [
            ...blocks.map(block => ({
                id: block.id,
                name: block.title,
                type: 'block' as const,
                parent: block.folderId
            })),
            ...folders.map(folder => ({
                id: folder.id,
                name: folder.name,
                type: 'folder' as const,
                parent: folder.parentId
            }))
        ];

        return structure;
    } catch (error) {
        console.error("Failed to fetch file system structure:", error);
        throw new Error("Failed to fetch file system structure");
    }
};

export const fetchUserName = async () => {
    const userId = await getUser();
    return await getUserNameWithCache(userId || "");
};

export const fetchCratePath = async (crateId: string) => {
    try {
        const path: { id: string; name: string }[] = [];
        let currentId = crateId;

        while (currentId && currentId !== ROOT_FOLDER_ID) {
            const folder = await getFolderWithCache(currentId);
            if (folder) {
                path.unshift({ id: folder.id, name: folder.name });
                currentId = folder.parentId || "";
            } else {
                break;
            }
        }

        return path;
    } catch (error) {
        console.error("Failed to fetch crate path:", error);
        return [];
    }
};

// ==================== CREATE OPERATIONS ====================

export const addBlock = async (title: string, parentId?: string) => {
    try {
        const userId = await getUser();
        if (!userId) throw new Error("User not authenticated");

        const block = await createBlock({
            title,
            authorId: userId,
            folderId: parentId || ROOT_FOLDER_ID
        });
        
        // Invalidate relevant caches
        await invalidateUserCache(userId);
        
        return block;
    } catch (error) {
        console.error("Failed to create block:", error);
        throw error;
    }
};

export const addCrate = async (title: string, icon: string, parentId?: string) => {
    try {
        const userId = await getUser();
        if (!userId) throw new Error("User not authenticated");

        const crate = await createFolder({
            name: title,
            authorId: userId,
            parentId: parentId || ROOT_FOLDER_ID,
            icon
        });
        
        // Invalidate relevant caches
        await invalidateUserCache(userId);
        
        return crate;
    } catch (error) {
        console.error("Failed to create crate:", error);
        throw error;
    }
};

// ==================== DELETE OPERATIONS ====================

export const deleteBlock = async (blockId: string) => {
    try {
        const userId = await getUser();
        if (!userId) throw new Error("User not authenticated");

        await removeBlock(blockId, userId);
        
        // Invalidate relevant caches
        await invalidateBlockCache(blockId);
        await invalidateUserCache(userId);
        
        return { success: true };
    } catch (error) {
        console.error("Failed to delete block:", error);
        throw error;
    }
};

export const deleteCrate = async (crateId: string) => {
    try {
        const userId = await getUser();
        if (!userId) throw new Error("User not authenticated");

        await deleteFolder(crateId, userId);
        
        // Invalidate relevant caches
        await invalidateFolderCache(crateId);
        await invalidateUserCache(userId);
        
        return { success: true };
    } catch (error) {
        console.error("Failed to delete crate:", error);
        throw error;
    }
};

// ==================== UPDATE OPERATIONS ====================

export const updateBlockTitle = async (blockId: string, newTitle: string) => {
    try {
        const userId = await getUser();
        if (!userId) throw new Error("User not authenticated");

        await setBlockTitle(blockId, newTitle);
        
        // Invalidate relevant caches
        await invalidateBlockCache(blockId);
        await invalidateUserCache(userId);
        
        return { success: true };
    } catch (error) {
        console.error("Failed to update block title:", error);
        throw error;
    }
};

export const renameFolderAction = async (folderId: string, newName: string) => {
    try {
        const userId = await getUser();
        if (!userId) throw new Error("User not authenticated");

        // Import the setFolderName function
        const { setFolderName } = await import('@/lib/folder');
        await setFolderName(folderId, newName);
        
        // Invalidate relevant caches
        await invalidateFolderCache(folderId);
        await invalidateUserCache(userId);
        
        return { success: true };
    } catch (error) {
        console.error("Failed to rename folder:", error);
        throw error;
    }
};

export const renameCrate = async (crateId: string, newName: string) => {
    try {
        const userId = await getUser();
        if (!userId) throw new Error("User not authenticated");

        // Import the setFolderName function (crates are stored as folders)
        const { setFolderName } = await import('@/lib/folder');
        await setFolderName(crateId, newName);
        
        // Invalidate relevant caches
        await invalidateFolderCache(crateId);
        await invalidateUserCache(userId);
        
        return { success: true };
    } catch (error) {
        console.error("Failed to rename crate:", error);
        throw error;
    }
};

export const changeCrateIcon = async (crateId: string, newIcon: string) => {
    try {
        const userId = await getUser();
        if (!userId) throw new Error("User not authenticated");

        // Import the setFolderIcon function
        const { setFolderIcon } = await import('@/lib/folder');
        await setFolderIcon(crateId, newIcon);
        
        // Invalidate relevant caches
        await invalidateFolderCache(crateId);
        await invalidateUserCache(userId);
        
        return { success: true };
    } catch (error) {
        console.error("Failed to change crate icon:", error);
        throw error;
    }
};

// ==================== USER OPERATIONS ====================

export const getCurrentUserAction = async () => {
    try {
        const { getCurrentUser } = await import('@/lib/user');
        const user = await getCurrentUser();
        return user;
    } catch (error) {
        console.error("Failed to get current user:", error);
        return null;
    }
}; 
