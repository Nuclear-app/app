"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDashboardItems, addBlock, addCrate, fetchUserName, fetchUserBlocks, fetchUserFolders } from "@/app/dashboard/actions";
import { Block, Crate } from "@/lib/types";
import { DashboardHeader } from "./DashboardHeader";
import { GridDisplay } from "./GridDisplay";
import { BlockDialog } from "./BlockDialog";
import { CrateDialog } from "./CrateDialog";
import { SelectionDialog } from "./SelectionDialog";

export default function Dashboard() {
    const router = useRouter();
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [crates, setCrates] = useState<Crate[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<Set<'blocks' | 'crates'>>(() => 
        new Set<'blocks' | 'crates'>(['blocks', 'crates'] as const)
    );
    const [userName, setUserName] = useState<string>("");
    const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [crateDialogOpen, setCrateDialogOpen] = useState(false);

    // Function to load data based on selection
    const loadData = async (types: Set<'blocks' | 'crates'>) => {
        try {
            console.log('Loading data for types:', Array.from(types));
            const name = await fetchUserName();
            setUserName(name || "User");

            // If both types are selected, use single query
            if (types.has('blocks') && types.has('crates')) {
                const data = await fetchDashboardItems();
                console.log('Raw dashboard items response:', data);
                console.log('Blocks from response:', data.blocks);
                console.log('Folders from response:', data.folders);
                
                const allItems = [
                    ...data.blocks.map(block => ({
                        id: block.id,
                        title: block.title,
                        createdAt: block.createdAt,
                        type: 'block' as const
                    })),
                    ...data.folders.map(folder => ({
                        id: folder.id,
                        title: folder.name,
                        createdAt: folder.createdAt,
                        icon: folder.icon || "blocks",
                        type: 'crate' as const
                    }))
                ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

                setBlocks(allItems.filter(item => item.type === 'block'));
                setCrates(allItems.filter(item => item.type === 'crate'));
                return;
            }

            // Otherwise, fetch only what's needed
            if (types.has('blocks')) {
                const blocksData = await fetchUserBlocks();
                console.log('Blocks data:', blocksData);
                
                setBlocks(blocksData.map(block => ({
                    id: block.id,
                    title: block.title,
                    createdAt: block.createdAt
                })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
            } else {
                setBlocks([]);
            }

            if (types.has('crates')) {
                const cratesData = await fetchUserFolders();
                console.log('Crates data:', cratesData);
                
                setCrates(cratesData.map(crate => ({
                    id: crate.id,
                    title: crate.name,
                    icon: crate.icon || "blocks",
                    createdAt: crate.createdAt
                })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
            } else {
                setCrates([]);
            }
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    // Initial load
    useEffect(() => {
        console.log('Component mounted, loading initial data...');
        loadData(selectedTypes);
    }, []);

    const toggleSelection = (type: 'blocks' | 'crates') => {
        const newSet = new Set(selectedTypes);
        if (newSet.has(type)) {
            newSet.delete(type);
        } else {
            newSet.add(type);
        }
        setSelectedTypes(newSet);
        loadData(newSet);
    };

    const handleCreateNew = () => {
        setSelectionDialogOpen(true);
    };

    const handleTypeSelect = (type: 'block' | 'crate') => {
        setSelectionDialogOpen(false);
        if (type === 'block') {
            setBlockDialogOpen(true);
        } else {
            setCrateDialogOpen(true);
        }
    };

    const handleCreateBlock = async (title: string) => {
        try {
            const block = await addBlock(title);
            setBlocks(prev => [...prev, { id: block.id, title: block.title, createdAt: block.createdAt }]);
            setBlockDialogOpen(false);
            router.push(`/onboarding/name/study-type?blockId=${block.id}&newBlock=false`);
        } catch (error) {
            console.error("Failed to create block:", error);
        }
    };

    const handleCreateCrate = async (title: string, icon: string) => {
        try {
            const crate = await addCrate(title, icon);
            setCrates(prev => [...prev, { 
                id: crate.id, 
                title: crate.name, 
                icon: crate.icon || "blocks",
                createdAt: crate.createdAt 
            }]);
            setCrateDialogOpen(false);
        } catch (error) {
            console.error("Failed to create crate:", error);
        }
    };

    return (
        <div className="container h-5/6 w-full">
            <DashboardHeader
                userName={userName}
                selectedTypes={selectedTypes}
                onCreateNew={handleCreateNew}
                onToggleSelection={toggleSelection}
            />
            
            <div className="mt-8">
                <GridDisplay
                    blocks={blocks}
                    crates={crates}
                    selectedTypes={selectedTypes}
                    onDeleteBlock={() => {}}
                    onDeleteCrate={() => {}}
                />
            </div>

            <SelectionDialog
                open={selectionDialogOpen}
                onOpenChange={setSelectionDialogOpen}
                onSelect={handleTypeSelect}
            />

            <BlockDialog
                open={blockDialogOpen}
                onOpenChange={setBlockDialogOpen}
                onCreateBlock={handleCreateBlock}
            />

            <CrateDialog
                open={crateDialogOpen}
                onOpenChange={setCrateDialogOpen}
                onCreateCrate={handleCreateCrate}
            />
        </div>
    );
} 