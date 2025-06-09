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
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
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
import { createClient } from "@/utils/supabase/client";

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

interface User {
    name: string;
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
    // const [selectedTypes, setSelectedTypes] = useState<Set<'blocks' | 'crates'>>(() => new Set());
    const [selectedTypes, setSelectedTypes] = useState<Set<'blocks' | 'crates'>>(() => new Set());
    const [userName, setUserName] = useState<string>("");
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [crateDialogOpen, setCrateDialogOpen] = useState(false);

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

                // Get user data from Supabase
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.user_metadata?.name) {
                    setUserName(user.user_metadata.name);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        };
        loadData();
    }, []);

    const toggleSelection = (type: 'blocks' | 'crates') => {
        setSelectedTypes(prev => {
            const newSet = new Set(prev) as Set<'blocks' | 'crates'>;
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    const handleCreateNew = () => {
        if (selectedTypes.size > 1) return;
        if (selectedTypes.has('blocks')) {
            setBlockDialogOpen(true);
        } else if (selectedTypes.has('crates')) {
            setCrateDialogOpen(true);
        }
    };

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
        <div className="container h-5/6 gap-4">
            <div className="w-full rounded-xl bg-[#161616] border-2 border-nuclear p-4 font-black text-3xl flex items-center justify-between">
                <h2 className="text-xl md:text-2xl">Welcome, {userName || "User"}!</h2>
                <div className="flex flex-col md:flex-row gap-4 space-around">
                    <Button
                        onClick={handleCreateNew}
                        className="bg-foreground text-background hover:bg-[#333333] flex items-center gap-2 px-4"
                        disabled={selectedTypes.size !== 1}
                    >
                        <Plus /> Create New
                    </Button>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <div className="flex h-10 items-center bg-background rounded-md">
                            <div className="flex items-center space-x-2 px-4">
                                <Checkbox 
                                    id="blocks"
                                    checked={selectedTypes.has('blocks')}
                                    onCheckedChange={() => toggleSelection('blocks')}
                                />
                                <label
                                    htmlFor="blocks"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Blocks
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex h-10 items-center bg-background rounded-md">
                            <div className="flex items-center space-x-2 px-4">
                                <Checkbox 
                                    id="crates"
                                    checked={selectedTypes.has('crates')}
                                    onCheckedChange={() => toggleSelection('crates')}
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
                </div>
            </div>

            <div className="col-span-2 row-span-7 bg-[#161616] rounded-xl border-2 p-4">
                <div className="flex justify-center">
                    <div className="flex flex-col items-start">
                        <div className="grid grid-cols-4 gap-8 ">
                            {selectedTypes.has('blocks') && blocks.map((block) => (
                                <Link 
                                    key={block.id} 
                                    href={`/dashboard/block/${block.id}`}
                                    className="col-span-4 md:col-span-2 lg:col-span-1 bg-[#292929] rounded-xl border-2 p-6 hover:bg-[#333333] aspect-square flex items-center justify-center"
                                >
                                    <h1 className="text-lg md:text-xl text-center">{truncateText(block.title, 15)}</h1>
                                </Link>
                            ))}
                            {selectedTypes.has('crates') && crates.map((crate) => {
                                const Icon = iconMap[crate.icon] || Blocks;
                                return (
                                    <Link
                                        key={crate.id}
                                        href={`/dashboard/crate/${crate.id}`}
                                        className="col-span-4 md:col-span-2 lg:col-span-1 bg-[#292929] rounded-xl border-2 p-6 hover:bg-[#333333] aspect-square flex items-center justify-center"
                                    >
                                        <Icon className="w-12 h-12" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
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

            <Dialog open={crateDialogOpen} onOpenChange={setCrateDialogOpen}>
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
        </div>
    );
}