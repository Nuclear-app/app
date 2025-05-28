"use client";

import { useEffect, useState } from "react";
import {
    Ampersands,
    Anvil,
    Atom,
    AudioWaveform,
    Blocks,
    Box,
    Cannabis,
    ChartNoAxesColumn,
    Cookie,
    Bird,
    Bug,
    Cat,
    Dog,
    Egg,
    Origami,
    // Panda,
    Shell,
    Squirrel,
    LandPlot,
    Lasso,
    SquareStack,
    Lollipop,
    Pizza,
    Dices,
    Gamepad,
    Puzzle,
    Dna,
    Activity,
    Brain,
    Flame,
    Plus
} from "lucide-react";
import Image from "next/image";
import jonas from "@/public/jonas.svg";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { fetchDashboardItems, addBlock, addCrate } from "@/app/dashboard/actions";
import Link from "next/link";

interface DashboardProps {
    userId: string;
}

interface Block {
    id: string;
    title: string;
}

interface Crate {
    id: string;
    title: string;
    icon: string;
}

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

// Update the iconMap to include all icons
const iconMap: { [key: string]: any } = {
    ampersands: Ampersands,
    anvil: Anvil,
    atom: Atom,
    audioWaveform: AudioWaveform,
    blocks: Blocks,
    box: Box,
    cannabis: Cannabis,
    chartNoAxesColumn: ChartNoAxesColumn,
    cookie: Cookie,
    bird: Bird,
    bug: Bug,
    cat: Cat,
    dog: Dog,
    egg: Egg,
    origami: Origami,
    // panda: Panda,
    shell: Shell,
    squirrel: Squirrel,
    landPlot: LandPlot,
    lasso: Lasso,
    squareStack: SquareStack,
    lollipop: Lollipop,
    pizza: Pizza,
    dices: Dices,
    gamepad: Gamepad,
    puzzle: Puzzle,
    dna: Dna,
    activity: Activity,
    brain: Brain,
    flame: Flame,
    plus: Plus
};

export default function Dashboard() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [crates, setCrates] = useState<Crate[]>([]);
    const [newBlockTitle, setNewBlockTitle] = useState("");
    const [newCrateTitle, setNewCrateTitle] = useState("");
    const [newCrateIcon, setNewCrateIcon] = useState("blocks");
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [crateDialogOpen, setCrateDialogOpen] = useState(false);

    // useEffect(() => {
    //     const loadData = async () => {
    //         const block = await initializeBlock();
    //         setBlockId(block?.id || "");
    //     };
    //     loadData();
    // }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const { blocks: blocksData, folders: cratesData } = await fetchDashboardItems();

                setBlocks(blocksData.map(block => ({
                    id: block.id,
                    title: block.title
                })));

                setCrates(cratesData.map(crate => ({
                    id: crate.id,
                    title: crate.name,
                    icon: crate.icon || "blocks"
                })));
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        };
        loadData();
    }, []);

    const handleCreateBlock = async () => {
        if (!newBlockTitle.trim()) return;
        try {
            const block = await addBlock(newBlockTitle);
            setBlocks(prev => [...prev, { id: block.id, title: block.title }]);
            setNewBlockTitle("");
            setBlockDialogOpen(false);
        } catch (error) {
            console.error("Failed to create block:", error);
        }
    };

    const handleCreateCrate = async () => {
        if (!newCrateTitle.trim()) return;
        try {
            const crate = await addCrate(newCrateTitle, newCrateIcon);
            setCrates(prev => [...prev, { id: crate.id, title: crate.name, icon: crate.icon || "blocks" }]);
            setNewCrateTitle("");
            setCrateDialogOpen(false);
        } catch (error) {
            console.error("Failed to create crate:", error);
        }
    };

    const handleBlockKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreateBlock();
        }
    };

    const handleCrateKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreateCrate();
        }
    };

    return (
        <div className="container h-5/6 grid grid-rows-8 grid-cols-3 gap-4">
            <div className="col-span-2 row-span-1 rounded-xl bg-[#161616] border-2 border-nuclear p-4 font-black text-3xl flex items-center">
                <h1>Nuclear</h1>
            </div>
            <div className="col-span-1 flex flex-col justify-between rounded-xl p-4 border-2 row-span-8 bg-[#161616] relative">
                <div className="absolute inset-0 z-0 flex justify-end">
                    <Image 
                        src={jonas} 
                        alt="Jonas" 
                        className="w-3/4 h-3/4 object-cover"
                    />
                </div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-black">Hi, I'm Jonas!</h1>
                </div>
                <div>
                    <div className="relative z-10 flex flex-col text-lg">Start off with a note today!</div>
                    <Button className="relative z-10 w-full bg-[#292929] h-12 hover:bg-[#333333] text-white text-xl">Notetaking</Button>
                </div>
            </div>
            <div className="col-span-2 row-span-4 bg-[#161616] rounded-xl border-2 p-4 overflow-y-auto">
                <h1 className="text-2xl font-black mb-4">Blocks</h1>
                <div className="grid grid-cols-9 gap-4">
                    <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                        <DialogTrigger asChild>
                            <div className="col-span-1 bg-[#292929] rounded-xl border-2 p-4 flex items-center justify-center hover:bg-[#333333] cursor-pointer transition-colors aspect-square">
                                <Plus className="w-6 h-6" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="bg-[#161616] border-2">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Create New Block</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Enter a name for your new block.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label htmlFor="blockTitle" className="text-sm font-medium">Title</label>
                                    <input
                                        id="blockTitle"
                                        value={newBlockTitle}
                                        onChange={(e) => setNewBlockTitle(e.target.value)}
                                        onKeyPress={handleBlockKeyPress}
                                        className="bg-[#292929] border rounded-md p-2"
                                    />
                                </div>
                                <Button onClick={handleCreateBlock}>Create Block</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {blocks.map((block) => (
                        <Link 
                            key={block.id} 
                            href={`/dashboard/block/${block.id}`}
                            className="bg-[#292929] rounded-xl border-2 p-2 hover:bg-[#333333] aspect-square flex items-center justify-center"
                        >
                            <h1 className="text-center">{truncateText(block.title, 10)}</h1>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="col-span-2 row-span-3  bg-[#161616] rounded-xl border-2 p-4 overflow-y-auto">
                <h1 className="text-2xl font-black mb-4">Crates</h1>
                <div className="grid grid-cols-9 gap-4">
                    <Dialog open={crateDialogOpen} onOpenChange={setCrateDialogOpen}>
                        <DialogTrigger asChild>
                            <div className="col-span-1 bg-[#292929] rounded-xl border-2 p-4 flex items-center justify-center hover:bg-[#333333] cursor-pointer transition-colors aspect-square">
                                <Plus className="w-6 h-6" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="bg-[#161616] border-2">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Create New Crate</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Choose an icon and name for your new crate.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label htmlFor="crateTitle" className="text-sm font-medium">Title</label>
                                    <input
                                        id="crateTitle"
                                        value={newCrateTitle}
                                        onChange={(e) => setNewCrateTitle(e.target.value)}
                                        onKeyPress={handleCrateKeyPress}
                                        className="bg-[#292929] border rounded-md p-2"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Icon</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {Object.entries(iconMap).map(([key, Icon]) => (
                                            <div
                                                key={key}
                                                onClick={() => setNewCrateIcon(key)}
                                                className={`p-2 rounded-md cursor-pointer ${newCrateIcon === key ? 'bg-[#333333]' : 'hover:bg-[#292929]'}`}
                                            >
                                                <Icon className="w-6 h-6" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={handleCreateCrate}>Create Crate</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {crates.map((crate) => {
                        const Icon = iconMap[crate.icon] || Blocks;
                        return (
                            <Link
                                key={crate.id}
                                href={`/dashboard/crate/${crate.id}`}
                                className="bg-[#292929] rounded-xl border-2 p-4 hover:bg-[#333333] aspect-square flex items-center justify-center"
                            >
                                <Icon className="w-6 h-6" />
                            </Link>
                        );
                    })}
                </div>
            </div>
            {/* <div className="col-span-1 row-span-1 flex flex-row gap-4">
                <Button className="w-full bg-[#292929] h-12 hover:bg-[#333333] text-white text-xl">Notetaking</Button>
                <div
                    className="w-full rounded-xl flex-1 flex flex-row items-center justify-center relative overflow-hidden"
                    style={{
                        backgroundImage: "url('/pointsBg.svg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <span className="relative z-10 text-black text-2xl font-bold flex items-center gap-2">
                    Hello
                    </span>
                </div>
            </div> */}
        </div>
    );
}
