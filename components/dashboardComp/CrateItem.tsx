import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Crate } from "@/lib/types";

interface CrateItemProps {
    crate: Crate;
    onDelete: (id: string) => void;
}

export function CrateItem({ crate, onDelete }: CrateItemProps) {
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
                                <span className="text-7xl">{crate.icon}</span>
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