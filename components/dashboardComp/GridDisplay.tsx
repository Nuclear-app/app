import { Block, Crate } from "@/lib/types";
import { BlockItem } from "./BlockItem";
import { CrateItem } from "./CrateItem";

interface GridDisplayProps {
    blocks: Block[];
    crates: Crate[];
    selectedTypes: Set<'blocks' | 'crates'>;
    onDeleteBlock: (id: string) => void;
    onDeleteCrate: (id: string) => void;
}

export function GridDisplay({ blocks, crates, selectedTypes, onDeleteBlock, onDeleteCrate }: GridDisplayProps) {
    if (selectedTypes.size === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xl md:text-2xl font-semibold text-muted-foreground">
                    Select blocks or crates above to view them!
                </p>
            </div>
        );
    }

    // If both types are selected, combine and sort them
    if (selectedTypes.has('blocks') && selectedTypes.has('crates')) {
        const combinedItems = [
            ...blocks.map(block => ({ ...block, type: 'block' as const })),
            ...crates.map(crate => ({ ...crate, type: 'crate' as const }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {combinedItems.map((item) => (
                    item.type === 'block' ? (
                        <BlockItem
                            key={item.id}
                            block={item}
                            onDelete={onDeleteBlock}
                        />
                    ) : (
                        <CrateItem
                            key={item.id}
                            crate={item}
                            onDelete={onDeleteCrate}
                        />
                    )
                ))}
            </div>
        );
    }

    // If only one type is selected, display that type
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedTypes.has('blocks') && blocks.map((block) => (
                <BlockItem 
                    key={block.id} 
                    block={block}
                    onDelete={onDeleteBlock}
                />
            ))}
            {selectedTypes.has('crates') && crates.map((crate) => (
                <CrateItem 
                    key={crate.id} 
                    crate={crate}
                    onDelete={onDeleteCrate}
                />
            ))}
        </div>
    );
} 