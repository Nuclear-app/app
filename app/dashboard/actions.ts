"use server"

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

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

// Authentication helper
const getUser = async () => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw new Error("Authentication failed");
    if (!user) throw new Error("No authenticated user found");

    return user.id;
};

// Single-purpose query methods
export const fetchUserBlocks = async () => {
    const userId = await getUser();
    
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            posts: {
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    folderId: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user.posts;
};

export const fetchUserFolders = async () => {
    const userId = await getUser();
    console.log('fetchUserFolders - Fetching for user:', userId);
    
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            folders: {
                select: {
                    id: true,
                    name: true,
                    icon: true,
                    createdAt: true,
                    parentId: true,
                    authorId: true  // Add this to check if folders are properly linked
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!user) {
        console.log('fetchUserFolders - User not found');
        throw new Error("User not found");
    }

    console.log('fetchUserFolders - Found folders:', user.folders.length);
    console.log('fetchUserFolders - Folders data:', JSON.stringify(user.folders, null, 2));
    return user.folders;
};

export const fetchRootBlocks = async () => {
    const userId = await getUser();
    
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            posts: {
                where: {
                    folderId: ROOT_FOLDER_ID
                },
                select: {
                    id: true,
                    title: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user.posts;
};

export const fetchRootFolders = async () => {
    const userId = await getUser();
    
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            folders: {
                where: {
                    parentId: ROOT_FOLDER_ID
                },
                select: {
                    id: true,
                    name: true,
                    icon: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user.folders;
};

// Composite methods that use single-purpose queries
export const fetchDashboardItems = async () => {
    try {
        const userId = await getUser();
        console.log('fetchDashboardItems - Fetching for user:', userId);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                posts: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        folderId: true,
                        authorId: true  // Add this to check if blocks are properly linked
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                folders: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        createdAt: true,
                        parentId: true,
                        authorId: true  // Add this to check if folders are properly linked
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!user) {
            console.log('fetchDashboardItems - User not found');
            throw new Error("User not found");
        }

        // Log detailed information about the query results
        console.log('fetchDashboardItems - Found posts:', user.posts.length);
        console.log('fetchDashboardItems - Found folders:', user.folders.length);
        console.log('fetchDashboardItems - Posts data:', JSON.stringify(user.posts, null, 2));
        console.log('fetchDashboardItems - Folders data:', JSON.stringify(user.folders, null, 2));

        const result = {
            blocks: user.posts.map(block => ({
                id: block.id,
                title: block.title,
                createdAt: block.createdAt,
                folderId: block.folderId
            })),
            folders: user.folders.map(folder => ({
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

export const fetchCrates = async () => {
    try {
        const userId = await getUser();

        const folders = await prisma.folder.findMany({
            where: {
                parentId: null, // Only root level folders
                authorId: userId // Only folders belonging to the current user
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
                title: title.trim(),
                authorId: userId,
                folderId,
                context: "",
                note: JSON.stringify({
                    type: "doc",
                    content: [{ type: "paragraph" }]
                })
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
        console.error("Failed to create block:", error);
        throw error;
    }
};

export const addCrate = async (name: string, icon: string | null = null, parentId: string | null = ROOT_FOLDER_ID) => {
    try {
        const userId = await getUser();

        const folder = await prisma.folder.create({
            data: {
                name,
                parentId,
                icon,
                authorId: userId
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
        throw error;
    }
};

export const fetchUserName = async () => {
    try {
        const userId = await getUser();
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, }
        });

        return user?.name || null;
    } catch (error) {
        console.error("Failed to fetch user name:", error);
        throw error;
    }
};

// export const deleteBlock = async (blockId: string) => {
//     try {
//         const userId = await getUser();
        
//         const block = await prisma.block.findUnique({
//             where: { id: blockId },
//             select: { authorId: true }
//         });

//         if (!block || block.authorId !== userId) {
//             throw new Error("Unauthorized to delete this block");
//         }

//         await prisma.block.delete({
//             where: { id: blockId }
//         });

//         return { success: true };
//     } catch (error) {
//         console.error("Failed to delete block:", error);
//         throw error;
//     }
// };

// export const deleteCrate = async (crateId: string) => {
//     try {
//         const userId = await getUser();
        
//         const crate = await prisma.folder.findUnique({
//             where: { id: crateId },
//             select: { 
//                 authorId: true,
//                 blocks: {
//                     select: {
//                         id: true
//                     }
//                 }
//             }
//         });

//         if (!crate || crate.authorId !== userId) {
//             throw new Error("Unauthorized to delete this crate");
//         }

//         // Delete all blocks in the crate first
//         if (crate.blocks.length > 0) {
//             await prisma.block.deleteMany({
//                 where: {
//                     folderId: crateId
//                 }
//             });
//         }

//         // Then delete the crate itself
//         await prisma.folder.delete({
//             where: { id: crateId }
//         });

//         return { success: true };
//     } catch (error) {
//         console.error("Failed to delete crate:", error);
//         throw error;
//     }
// }; 
