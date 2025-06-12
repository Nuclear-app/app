import Link from "next/link";
import { Block } from "@/lib/types";
import Image from "next/image";
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
import { useState } from "react";

interface BlockItemProps {
    block: Block;
    onDelete: (id: string) => void;
}

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

export function BlockItem({ block, onDelete }: BlockItemProps) {
    return (
        <ContextMenu>
            <ContextMenuTrigger className="w-full">
                <div className="relative w-full">
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
                                    <span>View Block</span>
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
                    className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-[#333333]"
                    onClick={() => onDelete(block.id)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Block</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

// className="bg-[#292929] rounded-xl border-2 p-6 hover:bg-[#333333] aspect-square flex flex-col items-start justify-between relative w-full"