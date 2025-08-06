import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { EmojiPicker } from "frimousse";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface RenameCrateDialogueProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentName: string;
    currentIcon: string;
    onRename: (newName: string, newIcon: string) => Promise<void>;
}

const renameCrateFormSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }).max(50, {
        message: "Title must be less than 50 characters.",
    }),
    icon: z.string(),
});

export function RenameCrateDialogue({ 
    open, 
    onOpenChange, 
    currentName, 
    currentIcon, 
    onRename 
}: RenameCrateDialogueProps) {
    const [selectedEmoji, setSelectedEmoji] = useState<string>(currentIcon);
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm<z.infer<typeof renameCrateFormSchema>>({
        resolver: zodResolver(renameCrateFormSchema),
        defaultValues: {
            title: currentName,
            icon: currentIcon,
        },
    });

    // Reset form when dialog opens/closes or current values change
    useEffect(() => {
        if (open) {
            form.reset({
                title: currentName,
                icon: currentIcon,
            });
            setSelectedEmoji(currentIcon);
            setIsLoading(false);
        }
    }, [open, currentName, currentIcon, form]);

    const handleSubmit = async (values: z.infer<typeof renameCrateFormSchema>) => {
        try {
            setIsLoading(true);
            await onRename(values.title, values.icon);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to rename crate:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#161616] border-2">
                <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Edit Crate</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Change the name and icon for your crate.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
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
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{selectedEmoji}</span>
                                                <span className="text-sm text-gray-400">Selected emoji</span>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto">
                                                <EmojiPicker.Root 
                                                    className="isolate flex w-fit flex-col bg-[#292929] dark:bg-neutral-900"
                                                    onEmojiSelect={(selection) => {
                                                        setSelectedEmoji(selection.emoji);
                                                        field.onChange(selection.emoji);
                                                    }}
                                                >
                                                    <EmojiPicker.Search className="z-10 mx-2 mt-2 appearance-none rounded-md bg-[#333333] px-2.5 py-2 text-sm text-white dark:bg-neutral-800" />
                                                    <EmojiPicker.Viewport className="relative flex-1 outline-hidden">
                                                        <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                                                            Loading…
                                                        </EmojiPicker.Loading>
                                                        <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                                                            No emoji found.
                                                        </EmojiPicker.Empty>
                                                        <EmojiPicker.List
                                                            className="select-none pb-1.5"
                                                            components={{
                                                                CategoryHeader: ({ category, ...props }) => (
                                                                    <div
                                                                        className="bg-[#292929] px-3 pt-3 pb-1.5 font-medium text-neutral-400 text-xs dark:bg-neutral-900"
                                                                        {...props}
                                                                    >
                                                                        {category.label}
                                                                    </div>
                                                                ),
                                                                Row: ({ children, ...props }) => (
                                                                    <div className="scroll-my-1.5 px-1.5" {...props}>
                                                                        {children}
                                                                    </div>
                                                                ),
                                                                Emoji: ({ emoji, ...props }) => (
                                                                    <button
                                                                        type="button"
                                                                        className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-[#333333] dark:data-[active]:bg-neutral-800"
                                                                        {...props}
                                                                    >
                                                                        {emoji.emoji}
                                                                    </button>
                                                                ),
                                                            }}
                                                        />
                                                    </EmojiPicker.Viewport>
                                                </EmojiPicker.Root>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 