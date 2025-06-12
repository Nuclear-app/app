"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Block, Crate } from "@/lib/types";
import { DashboardHeader } from "./DashboardHeader";
import { GridDisplay } from "./GridDisplay";
import { BlockDialog } from "./BlockDialog";
import { CrateDialog } from "./CrateDialog";
import { SelectionDialog } from "./SelectionDialog";
import { addBlock, addCrate } from "@/app/dashboard/actions";
import { loadData } from "../../lib/loadData";

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
    const fetchData = async (types: Set<'blocks' | 'crates'>) => {
        try {
            const result = await loadData({ types, useSeparateQueries: true });
            setBlocks(result.blocks);
            setCrates(result.crates);
            setUserName(result.userName);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    // Initial load
    useEffect(() => {
        console.log('Component mounted, loading initial data...');
        fetchData(selectedTypes);
    }, []);

    const toggleSelection = (type: 'blocks' | 'crates') => {
        const newSet = new Set(selectedTypes);
        if (newSet.has(type)) {
            newSet.delete(type);
        } else {
            newSet.add(type);
        }
        setSelectedTypes(newSet);
        fetchData(newSet);
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
        <div className="container h-5/6 w-full px-[12%] pt-[10%] pb-[4%]">
            <DashboardHeader
                customTitle={`Welcome, ${userName || "User"}!`}
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