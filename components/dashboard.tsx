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
    Panda,
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

interface DashboardProps {
    userId: string;
}

interface Block {
    id: string,
    title: string,
}

interface Crate {
    id: string,
    title: string,
    icon: string,
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
    panda: Panda,
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

    useEffect(() => {
        setBlocks([
            {
                id: "1",
                title: "Block 1",
            },
            {
                id: "2",
                title: "Block 2",
            },
            {
                id: "3",
                title: "Long ass title or something",
            },
        ]);
    }, []);


    useEffect(() => {
        setCrates([
            {
                id: "1",
                title: "Crate 1",
                icon: "blocks",
            },
            {
                id: "2",
                title: "Crate 2",
                icon: "cannabis",
            },
            {
                id: "3",
                title: "Crate 3",
                icon: "bird",
            },
        ]);
    }, []);

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
                    <div className="col-span-1 bg-[#292929] rounded-xl border-2 p-4 flex items-center justify-center hover:bg-[#333333] cursor-pointer transition-colors aspect-square">
                        <Plus className="w-6 h-6" />
                    </div>
                    {blocks.map((block) => (
                        <div key={block.id} className="bg-[#292929] rounded-xl border-2 p-2 hover:bg-[#333333] aspect-square flex items-center justify-center">
                            <h1>{truncateText(block.title, 10)}</h1>
                        </div>
                    ))}
                </div>
            </div>
            <div className="col-span-2 row-span-3  bg-[#161616] rounded-xl border-2 p-4 overflow-y-auto">
                <h1 className="text-2xl font-black mb-4">Crates</h1>
                <div className="grid grid-cols-9 gap-4">
                    <div className="col-span-1 bg-[#292929] rounded-xl border-2 p-4 flex items-center justify-center hover:bg-[#333333] cursor-pointer transition-colors aspect-square">
                        <Plus className="w-6 h-6" />
                    </div>
                    {crates.map((crate) => {
                        const Icon = iconMap[crate.icon.toLowerCase()];
                        return (
                            <div key={crate.id} className="bg-[#292929] rounded-xl border-2 p-2 hover:bg-[#333333] aspect-square flex items-center justify-center">
                                {Icon ? <Icon className="w-6 h-6" /> : <span>{crate.icon}</span>}
                            </div>
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
