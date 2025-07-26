import React from "react";
import Link from "next/link";
import { Block } from "@/lib/types";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical, Trash2, Eye, Pencil } from "lucide-react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { RenameDialogue } from "./RenameDialogue";
import { updateBlockTitle } from "@/app/dashboard/actions";
import { TooltipWrapper } from "@/components/ui/TooltipWrapper";
// import RenameDialogue from "./RenameDialogue";
// import { renameBlock } from "@/app/dashboard/actions";

interface BlockItemProps {
    block: Block;
    onDelete: (id: string) => void;
    onRename?: (id: string, newTitle: string) => void;
}

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

export function BlockItem({ block, onDelete, onRename }: BlockItemProps) {
    const [renameDialogueOpen, setRenameDialogueOpen] = useState(false);
    
    const handleRename = async (newTitle: string) => {
        try {
            await updateBlockTitle(block.id, newTitle);
            // Call the optional callback to update the UI
            onRename?.(block.id, newTitle);
            // Close the dialog after successful rename
            setRenameDialogueOpen(false);
        } catch (error) {
            console.error("Failed to rename block:", error);
            // Don't close the dialog if there's an error
            throw error;
        }
    };

    const openRenameDialogue = () => {
        // Use setTimeout to prevent recursion issues with menu state
        setTimeout(() => {
            setRenameDialogueOpen(true);
        }, 0);
    };

    return (
        <>
        <ContextMenu>
            <ContextMenuTrigger className="w-full">
        <div className="relative w-full">
            <TooltipWrapper text="Block" side="bottom">
                <Link
                    href={`/dashboard/block/${block.id}`}
                    className="block w-full"
                >
                    <Card className="bg-[#292929] hover:bg-[#333333] border-2 aspect-square">
                        <CardContent className="p-6 h-full flex flex-col items-start justify-between">
                            <div className="w-1/4 h-1/4 relative">
                                <Image
                                    src="/blockIcon.svg"
                                    alt="Block Icon"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="w-full flex flex-col">
                                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl">
                                    {truncateText(block.title, 15)}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(block.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </TooltipWrapper>
            <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div 
                            onMouseEnter={(e) => e.stopPropagation()}
                            onMouseLeave={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <TooltipWrapper text="Block Options" side="bottom">
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#333333]">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </TooltipWrapper>
                        </div>
                    </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[#292929] border border-[#333333]">
                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]">
                                    <Eye className="h-4 w-4" />
                                    <span>View Block</span>
                                </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]"
                                        onClick={openRenameDialogue}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span>Rename Block</span>
                                    </DropdownMenuItem>
                        <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-[#333333]"
                                    onClick={() => onDelete(block.id)}
                        >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Block</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
            </ContextMenuTrigger>

            <ContextMenuContent className="w-48 bg-[#292929] border border-[#333333]">
                <ContextMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]">
                    <Eye className="h-4 w-4" />
                    <span>View Block</span>
                </ContextMenuItem>

                    <ContextMenuItem
                        className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]"
                        onClick={openRenameDialogue}
                    >
                        <Pencil className="h-4 w-4" />
                        <span>Rename Block</span>
                    </ContextMenuItem>

                <ContextMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-[#333333]"
                    onClick={() => onDelete(block.id)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Block</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
            
            <RenameDialogue
                type="block"
                currentName={block.title}
                id={block.id}
                onRename={handleRename}
                open={renameDialogueOpen}
                onOpenChange={setRenameDialogueOpen}
            />
        </>
    );
}

// className="bg-[#292929] rounded-xl border-2 p-6 hover:bg-[#333333] aspect-square flex flex-col items-start justify-between relative w-full"