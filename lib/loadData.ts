

import { Block, Crate } from "@/lib/types";
import { fetchDashboardItems, fetchUserBlocks, fetchUserFolders, fetchUserName, fetchCratePath, CratePath } from "@/app/dashboard/actions";

interface LoadDataResult {
    blocks: Block[];
    crates: Crate[];
    userName: string;
    cratePath?: CratePath[];
    currentCrateName?: string;
}

interface LoadDataOptions {
    types: Set<'blocks' | 'crates'>;
    crateId?: string;
    useSeparateQueries?: boolean;
}

// Type for raw data from API
interface RawBlock {
    id: string;
    title: string;
    createdAt: string;
    folderId?: string;
}

// Type for folder data from API
interface ApiFolder {
    id: string;
    name: string;
    icon: string | null;
    createdAt: Date;
    parentId: string | null;
}

export async function loadData({ types, crateId, useSeparateQueries = false }: LoadDataOptions): Promise<LoadDataResult> {
    try {
        console.log('Loading data for types:', Array.from(types));
        const name = await fetchUserName();
        let blocks: Block[] = [];
        let crates: Crate[] = [];
        let cratePath: CratePath[] = [];
        let currentCrateName = "";

        // If we're in a crate view, fetch the path
        if (crateId) {
            cratePath = await fetchCratePath(crateId);
            if (cratePath.length > 0) {
                currentCrateName = cratePath[cratePath.length - 1].name;
            }
        }

        // If both types are selected and we don't want separate queries
        if (types.has('blocks') && types.has('crates') && !useSeparateQueries) {
            const data = await fetchDashboardItems();
            
            if (crateId) {
                // Filter for crate view
                blocks = data.blocks
                    .filter((block: RawBlock) => block.folderId === crateId)
                    .map((block: RawBlock) => ({
                        id: block.id,
                        title: block.title,
                        createdAt: new Date(block.createdAt)
                    }));

                crates = data.folders
                    .filter((folder: ApiFolder) => folder.parentId === crateId)
                    .map((crate: ApiFolder) => ({
                        id: crate.id,
                        name: crate.name,
                        icon: crate.icon || "blocks",
                        createdAt: crate.createdAt
                    }));
            } else {
                // Dashboard view - no filtering
                blocks = data.blocks.map((block: RawBlock) => ({
                    id: block.id,
                    title: block.title,
                    createdAt: new Date(block.createdAt)
                }));

                crates = data.folders.map((folder: ApiFolder) => ({
                    id: folder.id,
                    name: folder.name,
                    icon: folder.icon || "blocks",
                    createdAt: folder.createdAt
                }));
            }
        } else {
            // Fetch only what's needed using separate queries
            if (types.has('blocks')) {
                const blocksData = await fetchUserBlocks();
                blocks = blocksData
                    .filter(block => crateId ? block.folderId === crateId : true)
                    .map(block => ({
                        id: block.id,
                        title: block.title,
                        createdAt: block.createdAt
                    }));
            }

            if (types.has('crates')) {
                const cratesData = await fetchUserFolders();
                crates = cratesData
                    .filter((folder: ApiFolder) => crateId ? folder.parentId === crateId : true)
                    .map((crate: ApiFolder) => ({
                        id: crate.id,
                        name: crate.name,
                        icon: crate.icon || "blocks",
                        createdAt: crate.createdAt
                    }));
            }
        }

        // Sort both arrays by creation date
        blocks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        crates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return {
            blocks,
            crates,
            userName: name || "User",
            cratePath,
            currentCrateName
        };
    } catch (error) {
        console.error("Failed to load data:", error);
        throw error;
    }
} 