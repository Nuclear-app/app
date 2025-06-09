import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Blocks, FolderClosed } from "lucide-react";

interface SelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (type: 'block' | 'crate') => void;
}

export function SelectionDialog({ open, onOpenChange, onSelect }: SelectionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#161616] border-2">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Create New Item</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Button
                        onClick={() => onSelect('block')}
                        className="flex flex-col items-center gap-4 p-6 h-auto bg-muted-foreground hover:bg-foreground"
                    >
                        <Blocks className="w-12 h-12" />
                        <span className="text-lg font-semibold">Block</span>
                    </Button>
                    <Button
                        onClick={() => onSelect('crate')}
                        className="flex flex-col items-center gap-4 p-6 h-auto bg-muted-foreground hover:bg-foreground"
                    >
                        <FolderClosed className="w-12 h-12" />
                        <span className="text-lg font-semibold">Crate</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 