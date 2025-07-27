'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Block, Crate } from "@/lib/types";
import { GridDisplay } from "@/components/dashboardComp/GridDisplay";
import { DashboardHeader } from "@/components/dashboardComp/DashboardHeader";
import { BlockDialog } from "@/components/dashboardComp/BlockDialogue";
import { CrateDialog } from "@/components/dashboardComp/CrateDialogue";
import { SelectionDialog } from "@/components/dashboardComp/SelectionDialog";
import { addBlock, addCrate, CratePath } from "@/app/dashboard/actions";
import { CrateBreadcrumb } from "./crateBC";
import { loadData } from "@/lib/loadData";

interface CrateComponentProps {
    crateId: string;
}

export default function CrateComponent({ crateId }: CrateComponentProps) {
    const router = useRouter();
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [crates, setCrates] = useState<Crate[]>([]);
    const [cratePath, setCratePath] = useState<CratePath[]>([]);
    const [currentCrateName, setCurrentCrateName] = useState<string>("");
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
            const result = await loadData({ types, crateId });
            setBlocks(result.blocks);
            setCrates(result.crates);
            setUserName(result.userName);
            setCratePath(result.cratePath || []);
            setCurrentCrateName(result.currentCrateName || "");
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    // Initial load
    useEffect(() => {
        fetchData(selectedTypes);
    }, [crateId]);

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
            const block = await addBlock(title, crateId);
            setBlocks(prev => [...prev, { id: block.id, title: block.title, createdAt: block.createdAt }]);
            setBlockDialogOpen(false);
            router.push(`/onboarding/name/study-type?blockId=${block.id}&newBlock=false`);
        } catch (error) {
            console.error("Failed to create block:", error);
        }
    };

    const handleCreateCrate = async (title: string, icon: string) => {
        try {
            const crate = await addCrate(title, icon, crateId);
            setCrates(prev => [...prev, { 
                id: crate.id, 
                name: crate.name, 
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
            <CrateBreadcrumb cratePath={cratePath} />
            
            <DashboardHeader
                customTitle={currentCrateName}
                selectedTypes={selectedTypes}
                onCreateNew={handleCreateNew}
                onToggleSelection={toggleSelection}                
            />
            
            <div className="mt-8">
                <GridDisplay
                    blocks={blocks}
                    crates={crates}
                    selectedTypes={selectedTypes}
                    isLoading={false}
                    onDeleteBlock={() => Promise.resolve(undefined)}
                    onDeleteCrate={() => Promise.resolve(undefined)}
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