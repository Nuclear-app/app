"use server"

import prisma from "@/lib/prisma";

const ROOT_FOLDER_ID = "58b06f68-4d5b-4eef-8a5a-8f83de7a0aba";

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
    createdAt: Date;
}

export const fetchRootItems = async () => {
    try {
        const [blocks, folders] = await Promise.all([
            prisma.block.findMany({
                where: {
                    folderId: ROOT_FOLDER_ID
                },
                select: {
                    id: true,
                    title: true,
                    createdAt: true
                }
            }),
            prisma.folder.findMany({
                where: {
                    parentId: ROOT_FOLDER_ID
                },
                select: {
                    id: true,
                    name: true,
                    createdAt: true
                }
            })
        ]);
        return { blocks, folders };
    } catch (error) {
        console.error("Failed to fetch root items:", error);
        throw new Error("Failed to fetch root items");
    }
};

export const fetchFileSystemStructure = async (): Promise<DatabaseItem[]> => {
    try {
        const [blocks, folders] = await Promise.all([
            prisma.block.findMany({
                where: {
                    NOT: {
                        folderId: null
                    }
                },
                select: {
                    id: true,
                    title: true,
                    folderId: true
                }
            }),
            prisma.folder.findMany({
                where: {
                    NOT: {
                        parentId: null
                    }
                },
                select: {
                    id: true,
                    name: true,
                    parentId: true
                }
            })
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

export const fetchBlocks = async () => {
    try {
        const blocks = await prisma.block.findMany({
            select: {
                id: true,
                title: true,
                createdAt: true,
                folderId: true
            }
        });
        return blocks;
    } catch (error) {
        console.error("Failed to fetch blocks:", error);
        throw new Error("Failed to fetch blocks");
    }
};

export const fetchCrates = async () => {
    try {
        const folders = await prisma.folder.findMany({
            where: {
                parentId: null // Only root level folders
            },
            select: {
                id: true,
                name: true,
                createdAt: true
            }
        });
        return folders;
    } catch (error) {
        console.error("Failed to fetch crates:", error);
        throw new Error("Failed to fetch crates");
    }
};

export const addBlock = async (title: string, folderId: string | null = ROOT_FOLDER_ID) => {
    try {
        const userId = await getUser();
        const block = await prisma.block.create({
            data: {
                title,
                authorId: userId,
                folderId
            }
        });
        return block;
    } catch (error) {
        console.error("Failed to create block:", error);
        throw new Error("Failed to create block");
    }
};

export const addCrate = async (name: string, icon: string | null = null, parentId: string | null = ROOT_FOLDER_ID) => {
    try {
        const folder = await prisma.folder.create({
            data: {
                name,
                parentId,
                icon
            },
            select: {
                id: true,
                name: true,
                icon: true,
                createdAt: true
            }
        });
        return folder;
    } catch (error) {
        console.error("Failed to create crate:", error);
        throw new Error("Failed to create crate");
    }
};

export const fetchDashboardItems = async () => {
    try {
        // Fetch only blocks that have a folder (including root)
        const blocks = await prisma.block.findMany({
            where: {
                NOT: {
                    folderId: null
                }
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                folder: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Fetch only root-level crates
        const folders = await prisma.folder.findMany({
            where: {
                parentId: ROOT_FOLDER_ID
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                icon: true
            }
        });

        return {
            blocks: blocks.map(block => ({
                id: block.id,
                title: block.title,
                createdAt: block.createdAt,
                folderName: block.folder?.name
            })),
            folders
        };
    } catch (error) {
        console.error("Failed to fetch dashboard items:", error);
        throw new Error("Failed to fetch dashboard items");
    }
};

const getUser = async () => {
    let user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found");
    return user.id;
}; 