import Link from "next/link";
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
import { Crate } from "@/lib/types";
import { RenameCrateDialogue } from "./RenameCrateDialogue";
import { TooltipWrapper } from "@/components/ui/TooltipWrapper";
import { useState } from "react";
import { renameCrate, changeCrateIcon } from "@/app/dashboard/actions";

interface CrateItemProps {
    crate: Crate;
    onDelete: (id: string) => void;
    onRename?: (id: string, newName: string) => Promise<void>;
    onIconChange?: (id: string, newIcon: string) => Promise<void>;
}

export function CrateItem({ crate, onDelete, onRename, onIconChange }: CrateItemProps) {
    const [renameDialogueOpen, setRenameDialogueOpen] = useState(false);

    const handleRenameAndIconChange = async (newName: string, newIcon: string) => {
        try {
            // Call the backend functions
            await renameCrate(crate.id, newName);
            await changeCrateIcon(crate.id, newIcon);
            
            // Call the optional callbacks to update the UI
            onRename?.(crate.id, newName);
            onIconChange?.(crate.id, newIcon);
            
            // Close the dialog after successful update
            setRenameDialogueOpen(false);
        } catch (error) {
            console.error("Failed to update crate:", error);
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
                    <TooltipWrapper text="Crate" side="bottom">
                        <Link
                            href={`/dashboard/crate/${crate.id}`}
                            className="block w-full"
                        >
                            <Card className="bg-[#292929] hover:bg-[#333333] border-2 aspect-square">
                                <CardContent className="p-6 h-full flex flex-col items-start justify-between">
                                    <div className="w-full flex flex-col">
                                        <div className="w-3/12 h-3/12 relative flex items-center justify-center">
                                            <span className="text-7xl">{crate.icon}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(crate.createdAt).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </TooltipWrapper>
                    <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <TooltipWrapper text="Crate Options" side="bottom">
                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#333333]">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </TooltipWrapper>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[#292929] border border-[#333333]">
                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]">
                                    <Eye className="h-4 w-4" />
                                    <span>View Crate</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]"
                                    onClick={openRenameDialogue}
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span>Edit Crate</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-[#333333]"
                                    onClick={() => onDelete(crate.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Crate</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 bg-[#292929] border border-[#333333]">
                <ContextMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]">
                    <Eye className="h-4 w-4" />
                    <span>View Crate</span>
                </ContextMenuItem>
                <ContextMenuItem
                    className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]"
                    onClick={openRenameDialogue}
                >
                    <Pencil className="h-4 w-4" />
                    <span>Edit Crate</span>
                </ContextMenuItem>
                <ContextMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-[#333333]"
                    onClick={() => onDelete(crate.id)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Crate</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
            
        <RenameCrateDialogue
            currentName={crate.name}
            currentIcon={crate.icon || "📚"}
            open={renameDialogueOpen}
            onOpenChange={setRenameDialogueOpen}
            onRename={handleRenameAndIconChange}
        />
    </>
    );
} 