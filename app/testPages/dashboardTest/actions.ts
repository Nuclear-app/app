"use server"

import prisma from "@/lib/prisma";

const rootFolderId = "f2120a35-5e3f-488e-be86-f0753af42e77";

export interface DatabaseItem {
    id: string;
    name: string;
    type: 'block' | 'folder';
    parent: string | null;
}

export const fetchFileSystemStructure = async (): Promise<DatabaseItem[]> => {
    try {
        // Fetch all folders that have valid relationships
        const folders = await prisma.folder.findMany({
            where: {
                OR: [
                    { id: rootFolderId },
                    { parentId: { not: null } }
                ]
            },
            select: {
                id: true,
                name: true,
                parentId: true,
            }
        });

        // Create a set of valid folder IDs
        const validFolderIds = new Set(folders.map(folder => folder.id));

        // Fetch all blocks that have valid folder parents
        const blocks = await prisma.block.findMany({
            where: {
                folderId: {
                    in: Array.from(validFolderIds)
                }
            },
            select: {
                id: true,
                title: true,
                folderId: true,
            }
        });

        // Convert to common format, ensuring root folder is first
        const structure: DatabaseItem[] = [];
        
        // Add root folder first
        const rootFolder = folders.find(f => f.id === rootFolderId);
        if (rootFolder) {
            structure.push({
                id: rootFolder.id,
                name: rootFolder.name,
                type: 'folder',
                parent: null
            });
        }

        // Add remaining folders
        folders
            .filter(f => f.id !== rootFolderId)
            .forEach(folder => {
                structure.push({
                    id: folder.id,
                    name: folder.name,
                    type: 'folder',
                    parent: folder.parentId
                });
            });

        // Add blocks
        blocks.forEach(block => {
            structure.push({
                id: block.id,
                name: block.title,
                type: 'block',
                parent: block.folderId
            });
        });

        return structure;
    } catch (error) {
        console.error("Failed to fetch file system structure:", error);
        throw new Error("Failed to fetch file system structure");
    }
};

const getUser = async () => {
    let user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found");
    return user.id;
};

export const fetchItems = async (folderId: string | null) => {
    try {
        const [blocks, subFolders] = await Promise.all([
            prisma.block.findMany({
                where: { folderId: folderId },
                select: {
                    id: true,
                    title: true,
                    createdAt: true
                }
            }),
            prisma.folder.findMany({
                where: { parentId: folderId },
                select: {
                    id: true,
                    name: true,
                    createdAt: true
                }
            })
        ]);

        return { blocks, subFolders };
    }
    catch (error) {
        console.error("Failed to fetch items:", error);
        throw new Error("Failed to fetch items from database");
    }
};

export const addBlock = async (blockName: string, folderId: string | null) => {
    if (!folderId) {
        folderId = rootFolderId;
    }
    try {
        const userId = await getUser();
        
        const block = await prisma.block.create({
            data: {
                title: blockName,
                authorId: userId,
                folderId: folderId
            },
            select: {
                id: true,
                title: true,
                createdAt: true
            }
        });
        return block;
    } catch (error) {
        console.error("Failed to add block:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to add block to database: ${error.message}`);
        }
        throw new Error("Failed to add block to database");
    }
};

export const addFolder = async (folderName: string, parentId: string | null) => {
    if (!parentId) {
        parentId = rootFolderId;
    }
    try {
        const folder = await prisma.folder.create({
            data: {
                name: folderName,
                parentId: parentId
            },
            select: {
                id: true,
                name: true,
                createdAt: true
            }
        });
        return folder;
    } catch (error) {
        console.error("Failed to add folder:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to add folder to database: ${error.message}`);
        }
        throw new Error("Failed to add folder to database");
    }
};

export const getRootFolder = async () => {
    try {
        // Try to find the root folder (folder with no parent)
        let rootFolder = await prisma.folder.findFirst({
            where: { parentId: null },
            select: {
                id: true,
                name: true,
                createdAt: true
            }
        });

        return rootFolder;
    } catch (error) {
        console.error("Failed to get/create root folder:", error);
        throw new Error("Failed to get/create root folder");
    }
};