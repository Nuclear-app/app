"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Block, Crate } from "@/lib/types";
import { DashboardHeader } from "./DashboardHeader";
import { GridDisplay } from "./GridDisplay";
import { BlockDialog } from "./BlockDialogue";
import { CrateDialog } from "./CrateDialogue";
import { SelectionDialog } from "./SelectionDialog";
import { addBlock, addCrate, deleteBlock, deleteCrate, renameCrate, changeCrateIcon } from "@/app/dashboard/actions";
import { loadData } from "../../lib/loadData";
import { createClient } from "@/utils/supabase/client";

export default function Dashboard() {
    const router = useRouter();
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [crates, setCrates] = useState<Crate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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
            setIsLoading(true);
            const result = await loadData({ types, useSeparateQueries: true });
            setBlocks(result.blocks);
            setCrates(result.crates);
            setUserName(result.userName);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Check trial status using API
    const checkTrialStatus = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                // Use the API endpoint to check subscription status
                const response = await fetch('/api/auth/check-subscription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: user.id }),
                });

                if (response.ok) {
                    const { hasValidSubscription, trialExpired, subscriptionStatus } = await response.json();
                    
                    if (!hasValidSubscription) {
                        router.push('/transaction');
                        return;
                    }
                    
                    // Optional: Show trial status in console for debugging
                    if (subscriptionStatus !== 'PAID') {
                        console.log(`Subscription status: ${subscriptionStatus}, Trial expired: ${trialExpired}`);
                    }
                } else {
                    console.error("Failed to check subscription status");
                }
            }
        } catch (error) {
            console.error("Failed to check trial status:", error);
        }
    };

    // Initial load
    useEffect(() => {
        console.log('Component mounted, loading initial data...');
        fetchData(selectedTypes);
        checkTrialStatus(); // Check trial status on mount
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
            const block = await addBlock(title, undefined); // Root level block
            setBlocks(prev => [...prev, { id: block.id, title: block.title, createdAt: block.createdAt }]);
            setBlockDialogOpen(false);
            router.push(`/onboarding/name/study-type?blockId=${block.id}&newBlock=false`);
        } catch (error) {
            console.error("Failed to create block:", error);
        }
    };

    const handleCreateCrate = async (title: string, icon: string) => {
        try {
            const crate = await addCrate(title, icon, undefined); // Root level crate
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

    const handleDeleteBlock = async (blockId: string) => {
        try {
            await deleteBlock(blockId);
            // Update UI immediately by filtering out the deleted block
            setBlocks(prev => prev.filter(block => block.id !== blockId));
        } catch (error) {
            console.error("Failed to delete block:", error);
        }
    };

    const handleDeleteCrate = async (crateId: string) => {
        try {
            await deleteCrate(crateId);
            setCrates(prev => prev.filter(crate => crate.id !== crateId));
        } catch (error) {
            console.error("Failed to delete crate:", error);
        }
    };

    const handleRenameBlock = async (blockId: string, newTitle: string) => {
        try {            
            setBlocks(prev => prev.map(block => 
                block.id === blockId 
                    ? { ...block, title: newTitle }
                    : block
            ));
        } catch (error) {
            console.error("Failed to rename block:", error);
        }
    };

    const handleRenameCrate = async (crateId: string, newName: string) => {
        try {
            // Update the UI immediately
            setCrates(prev => prev.map(crate => 
                crate.id === crateId 
                    ? { ...crate, name: newName }
                    : crate
            ));
        } catch (error) {
            console.error("Failed to rename crate:", error);
        }
    };

    const handleChangeCrateIcon = async (crateId: string, newIcon: string) => {
        try {
            // Update the UI immediately
            setCrates(prev => prev.map(crate => 
                crate.id === crateId 
                    ? { ...crate, icon: newIcon }
                    : crate
            ));
        } catch (error) {
            console.error("Failed to change crate icon:", error);
        }
    };

    return (
        <div className="container h-5/6 w-full px-[12%] pt-[10%] pb-[4%]">
            <DashboardHeader
                customTitle={userName ? `Welcome, ${userName}!` : "Googling your name..."}
                selectedTypes={selectedTypes}
                onCreateNew={handleCreateNew}
                onToggleSelection={toggleSelection}
            />
            
            <div className="mt-8">
                <GridDisplay
                    blocks={blocks}
                    crates={crates}
                    selectedTypes={selectedTypes}
                    onDeleteBlock={handleDeleteBlock}
                    onDeleteCrate={handleDeleteCrate}
                    onRenameBlock={handleRenameBlock}
                    onRenameCrate={handleRenameCrate}
                    onChangeCrateIcon={handleChangeCrateIcon}
                    isLoading={isLoading}
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