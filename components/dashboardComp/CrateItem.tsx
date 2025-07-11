import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical, Trash2, Eye } from "lucide-react";
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
// import RenameDialogue from "./RenameDialogue";
// import { renameCrate } from "@/app/dashboard/actions";

interface CrateItemProps {
    crate: Crate;
    onDelete: (id: string) => void;
    // onRename?: (id: string, newName: string) => void;
}

export function CrateItem({ crate, onDelete }: CrateItemProps) {
    // const handleRename = async (id: string, newName: string) => {
    //     try {
    //         // await renameCrate(id, newName);
    //         // Call the optional callback to update the UI
    //         onRename?.(id, newName);
    //     } catch (error) {
    //         console.error("Failed to rename crate:", error);
    //         throw error;
    //     }
    // };

    return (
        <ContextMenu>
            <ContextMenuTrigger className="w-full">
                <div className="relative w-full">
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
                    <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#333333]">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[#292929] border border-[#333333]">
                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]">
                                    <Eye className="h-4 w-4" />
                                    <span>View Crate</span>
                                </DropdownMenuItem>
                                {/* <RenameDialogue
                                    type="crate"
                                    currentName={crate.name}
                                    id={crate.id}
                                    trigger={
                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]">
                                            <span>Rename Crate</span>
                                        </DropdownMenuItem>
                                    }
                                /> */}
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
                {/* <RenameDialogue
                    type="crate"
                    currentName={crate.name}
                    id={crate.id}
                    trigger={
                        <ContextMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]">
                            <span>Rename Crate</span>
                        </ContextMenuItem>
                    }
                /> */}
                <ContextMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-[#333333]"
                    onClick={() => onDelete(crate.id)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Crate</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
} 