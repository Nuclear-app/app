import Link from "next/link";
import { Block } from "@/lib/types";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";
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
    // const handleDelete = async () => {
    //     try {
    //         await deleteBlock(block.id);
    //         onDelete(block.id);
    //     } catch (error) {
    //         console.error("Failed to delete block:", error);
    //     }
    // };

    return (
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
            {/* Temporarily removed delete functionality
            <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={handleDelete}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            */}
        </div>
    );
}

// className="bg-[#292929] rounded-xl border-2 p-6 hover:bg-[#333333] aspect-square flex flex-col items-start justify-between relative w-full"