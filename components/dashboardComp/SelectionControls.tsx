import { Checkbox } from "@/components/ui/checkbox";

interface SelectionControlsProps {
    selectedTypes: Set<'blocks' | 'crates'>;
    onToggleSelection: (type: 'blocks' | 'crates') => void;
}

export function SelectionControls({ selectedTypes, onToggleSelection }: SelectionControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex h-10 items-center bg-[#3C3535] rounded-md">
                <div className="flex items-center space-x-2 px-4">
                    <Checkbox 
                        id="blocks"
                        checked={selectedTypes.has('blocks')}
                        onCheckedChange={() => onToggleSelection('blocks')}
                    />
                    <label
                        htmlFor="blocks"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Blocks
                    </label>
                </div>
            </div>
            
            <div className="flex h-10 items-center bg-[#3C3535] rounded-md">
                <div className="flex items-center space-x-2 px-4">
                    <Checkbox 
                        id="crates"
                        checked={selectedTypes.has('crates')}
                        onCheckedChange={() => onToggleSelection('crates')}
                    />
                    <label
                        htmlFor="crates"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Crates
                    </label>
                </div>
            </div>
        </div>
    );
} 