"use server"

import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

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

const getUser = async () => {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
            console.error("Auth error:", error);
            throw new Error("Authentication failed");
        }
        
        if (!user) {
            throw new Error("No authenticated user found");
        }
        
        return user.id;
    } catch (error) {
        console.error("Failed to get user:", error);
        throw error;
    }
};

export const fetchDashboardItems = async () => {
    try {
        const userId = await getUser();

        // Fetch only blocks that belong to the authenticated user
        const blocks = await prisma.block.findMany({
            where: {
                authorId: userId,
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

        // Fetch folders (crates)
        const folders = await prisma.folder.findMany({
            where: {
                NOT: {
                    parentId: null
                }
            },
            select: {
                id: true,
                name: true,
                icon: true,
                createdAt: true
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
        console.error("Failed to fetch dashboard items. Details:", error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error("Failed to fetch dashboard items: Unknown error");
        }
    }
};

export const fetchRootItems = async () => {
    try {
        const userId = await getUser();

        const [blocks, folders] = await Promise.all([
            prisma.block.findMany({
                where: {
                    authorId: userId,
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
        const userId = await getUser();

        const [blocks, folders] = await Promise.all([
            prisma.block.findMany({
                where: {
                    authorId: userId,
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
        const userId = await getUser();

        const blocks = await prisma.block.findMany({
            where: {
                authorId: userId
            },
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
        // Validate inputs
        if (!title?.trim()) {
            throw new Error("Block title is required");
        }

        // Get authenticated user
        const userId = await getUser();

        // Validate folder exists if provided
        if (folderId) {
            const folder = await prisma.folder.findUnique({
                where: { id: folderId }
            });
            if (!folder) {
                throw new Error(`Folder with ID ${folderId} not found`);
            }
        }

        // Create the block
        const block = await prisma.block.create({
            data: {
                title: title.trim(),
                authorId: userId,
                folderId,
                context: "", // Initialize with empty context
                note: JSON.stringify({
                    type: "doc",
                    content: [{ type: "paragraph" }]
                }) // Initialize with empty editor state
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                folderId: true,
                authorId: true
            }
        });

        return block;
    } catch (error) {
        console.error("Failed to create block. Details:", error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error("Failed to create block: Unknown error");
        }
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