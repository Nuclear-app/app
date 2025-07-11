import { Block, Crate } from "@/lib/types";
import { BlockItem } from "./BlockItem";
import { CrateItem } from "./CrateItem";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface GridDisplayProps {
    blocks: Block[];
    crates: Crate[];
    selectedTypes: Set<'blocks' | 'crates'>;
    onDeleteBlock: (blockId: string) => Promise<void>;
    onDeleteCrate: (crateId: string) => Promise<void>;
    onRenameBlock?: (blockId: string, newTitle: string) => Promise<void>;
    // onRenameCrate?: (crateId: string, newName: string) => Promise<void>;
    isLoading: boolean;
}

// Particle animation variants
const particleVariants = {
    initial: { scale: 0, opacity: 1 },
    animate: {
        scale: [0, 1, 0],
        opacity: [1, 1, 0],
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

// Create particles for the burst effect
const createParticles = (count: number) => {
    return Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const distance = 100;
        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            color: `hsl(${(i * 360) / count}, 70%, 50%)`
        };
    });
};

export function GridDisplay({ 
    blocks, 
    crates, 
    selectedTypes, 
    onDeleteBlock, 
    onDeleteCrate, 
    onRenameBlock,
    // onRenameCrate,
    isLoading 
}: GridDisplayProps) {
    if (selectedTypes.size === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xl md:text-2xl font-semibold text-muted-foreground">
                    Select blocks or crates above to view them!
                </p>
            </div>
        );
    }

    // Create skeleton items for loading state
    const skeletonItems = Array.from({ length: 6 }, (_, i) => (
        <div key={`skeleton-${i}`} className="w-full aspect-square">
            <Skeleton className="w-full h-full rounded-lg" />
        </div>
    ));

    // If both types are selected, combine and sort them
    if (selectedTypes.has('blocks') && selectedTypes.has('crates')) {
        const combinedItems = [
            ...blocks.map(block => ({ ...block, type: 'block' as const })),
            ...crates.map(crate => ({ ...crate, type: 'crate' as const }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    skeletonItems
                ) : (
                    <AnimatePresence mode="popLayout">
                        {combinedItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{
                                    scale: [1, 1.2, 0],
                                    opacity: [1, 1, 0],
                                    transition: {
                                        duration: 0.5,
                                        ease: "easeInOut"
                                    }
                                }}
                                transition={{ 
                                    duration: 0.2,
                                    layout: { duration: 0.3 }
                                }}
                                className="relative"
                            >
                                {item.type === 'block' ? (
                                    <>
                                        <BlockItem
                                            block={item}
                                            onDelete={() => onDeleteBlock(item.id)}
                                            onRename={onRenameBlock}
                                        />
                                        <AnimatePresence>
                                            {createParticles(8).map((particle, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: particle.color }}
                                                    variants={particleVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    exit="exit"
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <>
                                        <CrateItem
                                            crate={item}
                                            onDelete={() => onDeleteCrate(item.id)}
                                            // onRename={onRenameCrate}
                                        />
                                        <AnimatePresence>
                                            {createParticles(8).map((particle, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: particle.color }}
                                                    variants={particleVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    exit="exit"
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        );
    }

    // If only one type is selected, display that type
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
                skeletonItems
            ) : (
                <>
                    {selectedTypes.has('blocks') && (
                        <AnimatePresence mode="popLayout">
                            {blocks.map((block) => (
                                <motion.div
                                    key={block.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{
                                        scale: [1, 1.2, 0],
                                        opacity: [1, 1, 0],
                                        transition: {
                                            duration: 0.5,
                                            ease: "easeInOut"
                                        }
                                    }}
                                    transition={{ 
                                        duration: 0.2,
                                        layout: { duration: 0.3 }
                                    }}
                                    className="relative"
                                >
                                    <BlockItem
                                        block={block}
                                        onDelete={() => onDeleteBlock(block.id)}
                                        onRename={onRenameBlock}
                                    />
                                    <AnimatePresence>
                                        {createParticles(8).map((particle, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                                                style={{ backgroundColor: particle.color }}
                                                variants={particleVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                            />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                    {selectedTypes.has('crates') && (
                        <AnimatePresence mode="popLayout">
                            {crates.map((crate) => (
                                <motion.div
                                    key={crate.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{
                                        scale: [1, 1.2, 0],
                                        opacity: [1, 1, 0],
                                        transition: {
                                            duration: 0.5,
                                            ease: "easeInOut"
                                        }
                                    }}
                                    transition={{ 
                                        duration: 0.2,
                                        layout: { duration: 0.3 }
                                    }}
                                    className="relative"
                                >
                                    <CrateItem
                                        crate={crate}
                                        onDelete={() => onDeleteCrate(crate.id)}
                                        // onRename={onRenameCrate}
                                    />
                                    <AnimatePresence>
                                        {createParticles(8).map((particle, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                                                style={{ backgroundColor: particle.color }}
                                                variants={particleVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                            />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </>
            )}
        </div>
    );
} 