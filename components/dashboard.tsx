"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Input } from "./ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

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
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

// Form schemas
const blockFormSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }).max(50, {
        message: "Title must be less than 50 characters.",
    }),
});

const crateFormSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }).max(50, {
        message: "Title must be less than 50 characters.",
    }),
    icon: z.string(),
});

export default function Dashboard() {
    const router = useRouter();
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

    // Block form
    const blockForm = useForm<z.infer<typeof blockFormSchema>>({
        resolver: zodResolver(blockFormSchema),
        defaultValues: {
            title: "",
        },
    });

    // Crate form
    const crateForm = useForm<z.infer<typeof crateFormSchema>>({
        resolver: zodResolver(crateFormSchema),
        defaultValues: {
            title: "",
            icon: "blocks",
        },
    });

    const handleCreateBlock = async (values: z.infer<typeof blockFormSchema>) => {
        try {
            const block = await addBlock(values.title);
            setBlocks(prev => [...prev, { id: block.id, title: block.title }]);
            blockForm.reset();
            setBlockDialogOpen(false);
            // Navigate to the new block
            router.push(`/onboarding/name/study-type?blockId=${block.id}&newBlock=false`);
        } catch (error) {
            console.error("Failed to create block:", error);
        }
    };

    const handleCreateCrate = async (values: z.infer<typeof crateFormSchema>) => {
        try {
            const crate = await addCrate(values.title, values.icon);
            setCrates(prev => [...prev, { id: crate.id, title: crate.name, icon: crate.icon || "blocks" }]);
            crateForm.reset();
            setCrateDialogOpen(false);
        } catch (error) {
            console.error("Failed to create crate:", error);
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
                            <Form {...blockForm}>
                                <form onSubmit={blockForm.handleSubmit(handleCreateBlock)} className="space-y-4">
                                    <FormField
                                        control={blockForm.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="bg-[#292929] border rounded-md p-2" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit">Create Block</Button>
                                </form>
                            </Form>
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
                            <Form {...crateForm}>
                                <form onSubmit={crateForm.handleSubmit(handleCreateCrate)} className="space-y-4">
                                    <FormField
                                        control={crateForm.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="bg-[#292929] border rounded-md p-2" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={crateForm.control}
                                        name="icon"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Icon</FormLabel>
                                                <FormControl>
                                                    <div className="grid grid-cols-6 gap-2">
                                                        {Object.entries(iconMap).map(([key, Icon]) => (
                                                            <div
                                                                key={key}
                                                                onClick={() => field.onChange(key)}
                                                                className={`p-2 rounded-md cursor-pointer ${field.value === key ? 'bg-[#333333]' : 'hover:bg-[#292929]'}`}
                                                            >
                                                                <Icon className="w-6 h-6" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit">Create Crate</Button>
                                </form>
                            </Form>
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
