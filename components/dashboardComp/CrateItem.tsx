import Link from "next/link";
import { Blocks } from "lucide-react";
import { Crate, iconMap } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CrateItemProps {
    crate: Crate;
    onDelete: (id: string) => void;
}

export function CrateItem({ crate, onDelete }: CrateItemProps) {
    const Icon = iconMap[crate.icon] || Blocks;
    
    // const handleDelete = async () => {
    //     try {
    //         await deleteCrate(crate.id);
    //         onDelete(crate.id);
    //     } catch (error) {
    //         console.error("Failed to delete crate:", error);
    //     }
    // };

    return (
        <div className="relative w-full">
            <Link
                href={`/dashboard/crate/${crate.id}`}
                className="block w-full"
            >
                <Card className="bg-[#292929] hover:bg-[#333333] border-2 aspect-square">
                    <CardContent className="p-6 h-full flex flex-col items-start justify-between">
                        <div className="w-full flex flex-col">
                            <div className="w-3/12 h-3/12 relative flex items-center justify-center">
                                <Icon className="w-full h-full" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {new Date(crate.createdAt).toLocaleDateString()}
                        </p>
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