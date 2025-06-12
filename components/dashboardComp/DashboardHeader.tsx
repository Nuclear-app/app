import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectionControls } from "./SelectionControls";

interface DashboardHeaderProps {
    selectedTypes: Set<'blocks' | 'crates'>;
    onCreateNew: () => void;
    onToggleSelection: (type: 'blocks' | 'crates') => void;
    customTitle: string;
}

export function DashboardHeader({ selectedTypes, onCreateNew, onToggleSelection, customTitle }: DashboardHeaderProps) {
    return (
        <div className="w-full rounded-xl bg-[#161616] border-2 border-nuclear p-4 font-black text-3xl flex items-center justify-between">
            <h2 className="text-xl md:text-2xl">
                {customTitle}
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 space-around">
                <Button
                    onClick={onCreateNew}
                    className="bg-foreground text-background hover:bg-[#333333] flex items-center gap-2 px-3.5"
                >
                    Create New
                </Button>
                <SelectionControls 
                    selectedTypes={selectedTypes}
                    onToggleSelection={onToggleSelection}
                />
            </div>
        </div>
    );
} 