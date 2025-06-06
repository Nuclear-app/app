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
import { createClient } from "@/utils/supabase/client";

interface DashboardProps {
    userId: string;
}

interface Block {
    id: string;
    title: string;
    emoji?: string;
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
    emoji: z.string().min(1, {
        message: "Emoji is required.",
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
            emoji: "📝",
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

    const emojis = ["📝", "📚", "🎯", "💡", "🔍", "📊", "🎨", "🧮", "🔬", "🧪", "📱", "💻", "🌟", "⭐", "🎉", "🚀", "🎮", "🎲", "🎼", "🎵", "🎹", "🎸", "🎺", "🎭", "🎨", "📷", "🎥", "📺", "📻", "📱"];

    const handleCreateBlock = async (values: z.infer<typeof blockFormSchema>) => {
        try {
            const block = await addBlock(values.title);
            setBlocks(prev => [...prev, { id: block.id, title: block.title, emoji: values.emoji }]);
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
        <div className="container h-5/6 grid grid-rows-8 grid-cols-3 gap-4">
            <div className="col-span-2 row-span-1 rounded-xl bg-[#161616] border-2 border-nuclear p-4 font-black text-3xl flex items-center justify-between">
                <h2 className="text-2xl">Welcome, {userName || "User"}!</h2>
                <div className="flex gap-4">
                    <Button
                        onClick={handleCreateNew}
                        className="bg-foreground text-background hover:bg-[#333333] flex items-center gap-2"
                        disabled={selectedTypes.size !== 1}
                    >
                        <Plus className="w-4 h-4" /> Create New
                    </Button>
                    <Button
                        onClick={() => toggleSelection('blocks')}
                        className={`${selectedTypes.has('blocks') ? 'bg-foreground text-background' : 'bg-muted'} hover:bg-[#333333]`}
                    >
                        Blocks
                    </Button>
                    <Button
                        onClick={() => toggleSelection('crates')}
                        className={`${selectedTypes.has('crates') ? 'bg-foreground text-background' : 'bg-muted'} hover:bg-[#333333]`}
                    >
                        Crates
                    </Button>
                </div>
            </div>

            <div className="justify-center col-span-2 row-span-7 bg-[#161616] rounded-xl border-2 p-4 overflow-y-auto">
                <div className="flex justify-center w-full">
                    <div className="flex w-[900px] h-[600px] p-[50px] flex-col justify-between items-start">
                        <div className="grid grid-cols-4 gap-8 w-full">
                            {selectedTypes.has('blocks') && blocks.map((block) => (
                                <Link 
                                    key={block.id} 
                                    href={`/dashboard/block/${block.id}`}
                                    className="bg-[#292929] rounded-xl border-2 p-6 hover:bg-[#333333] aspect-square flex items-center justify-center"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <span className="text-4xl">{block.emoji || "📝"}</span>
                                        <h1 className="text-xl text-center">{truncateText(block.title, 15)}</h1>
                                    </div>
                                </Link>
                            ))}
                            {selectedTypes.has('crates') && crates.map((crate) => {
                                const Icon = iconMap[crate.icon] || Blocks;
                                return (
                                    <Link
                                        key={crate.id}
                                        href={`/dashboard/crate/${crate.id}`}
                                        className="bg-[#292929] rounded-xl border-2 p-6 hover:bg-[#333333] aspect-square flex items-center justify-center"
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
                            Choose an emoji and enter a name for your new block.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...blockForm}>
                        <form onSubmit={blockForm.handleSubmit(handleCreateBlock)} className="space-y-4">
                            <FormField
                                control={blockForm.control}
                                name="emoji"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Emoji</FormLabel>
                                        <FormControl>
                                            <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto">
                                                {emojis.map((emoji) => (
                                                    <div
                                                        key={emoji}
                                                        onClick={() => field.onChange(emoji)}
                                                        className={`p-2 rounded-md cursor-pointer text-2xl flex items-center justify-center ${field.value === emoji ? 'bg-[#333333]' : 'hover:bg-[#292929]'}`}
                                                    >
                                                        {emoji}
                                                    </div>
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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