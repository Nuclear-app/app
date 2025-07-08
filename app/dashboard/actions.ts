
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Mode } from "@/lib/generated/prisma";
import { getUserById, getUserCrates, getUserName } from "@/lib/user";
import { getUserFolders, getUserPosts } from "@/lib/user";
import { createFolder, deleteFolder, getFolderById, getTopLevelFolders } from "@/lib/folder";
import { createBlock, getTopLevelBlocks } from "@/lib/block";

const ROOT_FOLDER_ID = "f2120a35-5e3f-488e-be86-f0753af42e77";

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

// Authentication helper
const getUser = async () => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // if (error) throw new Error("Authentication failed");
    // if (!user) throw new Error("No authenticated user found");

    return user?.id;
};

// Single-purpose query methods
export const fetchUserBlocks = async () => {
    const userId = await getUser();

    const userPosts = await getUserPosts(userId || "");
    return userPosts;
};

export const fetchUserFolders = async () => {
    const userId = await getUser();
    console.log('fetchUserFolders - Fetching for user:', userId);
    
    const userFolders = getUserFolders(userId || "'");

    console.log('fetchUserFolders - Folders data:', JSON.stringify(userFolders, null, 2));
    return userFolders;
};

export const fetchRootBlocks = async () => {
    const userId = await getUser();
    
    const blocks = await getTopLevelBlocks(userId || "");

    return blocks;
};

export const fetchRootFolders = async () => {
    const userId = await getUser();
    
    const folders = await getTopLevelFolders(userId || "");

    return folders;
};

// Composite methods that use single-purpose queries
export const fetchDashboardItems = async () => {
    try {
        const userId = await getUser();
        console.log('fetchDashboardItems - Fetching for user:', userId);

        const blocks = await getUserPosts(userId || "");

        const folders = await getUserFolders(userId || "");

        const result = {
            blocks: blocks.map(block => ({
                id: block.id,
                title: block.title,
                createdAt: block.createdAt,
                folderId: block.folderId
            })),
            folders: folders.map(folder => ({
                id: folder.id,
                name: folder.name,
                icon: folder.icon,
                createdAt: folder.createdAt,
                parentId: folder.parentId
            }))
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

        const [blocks, folders] = await Promise.all([
            getUserPosts(userId || "").then(posts => 
                posts
                    .filter(block => block.folderId !== null)
                    .map(block => ({
                        id: block.id,
                        title: block.title,
                        folderId: block.folderId
                    }))
            ),
            getUserFolders(userId || "").then(folders => 
                folders
                    .filter(folder => folder.parentId !== null)
                    .map(folder => ({
                        id: folder.id,
                        name: folder.name,
                        parentId: folder.parentId
                    }))
            )
        ]);

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

export const fetchCrates = async () => {
    try {
        const userId = await getUser();
        return getUserCrates(userId || "");
    } catch (error) {
        console.error("Failed to fetch crates:", error);
        throw new Error("Failed to fetch crates");
    }
};

export const addBlock = async (title: string, folderId: string | null = ROOT_FOLDER_ID, mode?: Mode) => {
    try {
        const userId = await getUser();
        console.log("This is how the block is actually created")
        const block = await createBlock({
            title,
            authorId: userId || "",
            folderId: folderId || undefined,
            context: "",
            note: JSON.stringify({
                type: "doc",
                content: [{ type: "paragraph" }]
            }),
            points: 0
        })

        return block;
    } catch (error) {
        console.error("Failed to add block:", error);
        throw error;
    }
};

export const addCrate = async (name: string, icon: string | null = null, parentId: string | null = ROOT_FOLDER_ID) => {
    try {
        const userId = await getUser();

        const folder = await createFolder({
            name,
            parentId: parentId || undefined,
            icon: icon || undefined,
            authorId: userId
        });

        return folder;
    } catch (error) {
        console.error("Failed to create crate:", error);
        throw error;
    }
};

export const fetchUserName = async () => {
    try {
        const userId = await getUser();
        
        return getUserName(userId || "");
    } catch (error) {
        console.error("Failed to fetch user name:", error);
        throw error;
    }
};

export const fetchCratePath = async (crateId: string): Promise<CratePath[]> => {
    try {
        const userId = await getUser();
        const path: CratePath[] = [];
        
        let currentCrate = await getFolderById(crateId)

        while (currentCrate) {
            path.unshift({
                id: currentCrate.id,
                name: currentCrate.name
            });

            if (!currentCrate.parentId || currentCrate.parentId === ROOT_FOLDER_ID) break;

            currentCrate = await getFolderById(currentCrate.parentId)
        }

        return path;
    } catch (error) {
        console.error("Failed to fetch crate path:", error);
        throw error;
    }
};

export const deleteBlock = async (blockId: string, userId?: string): Promise<{ success: boolean }> => {
    try {
        const userId = await getUser();
        
        return deleteBlock(blockId, userId);
    } catch (error) {
        console.error("Failed to delete block:", error);
        throw error;
    }
};

export const deleteCrate = async (crateId: string) => {
    try {
        const userId = await getUser();
        
        return deleteFolder(crateId, userId);
    } catch (error) {
        console.error("Failed to delete crate:", error);
        throw error;
    }
}; 
