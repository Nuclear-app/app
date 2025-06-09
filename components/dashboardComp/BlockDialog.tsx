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
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

interface BlockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateBlock: (title: string) => Promise<void>;
}

const blockFormSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }).max(50, {
        message: "Title must be less than 50 characters.",
    }),
});

export function BlockDialog({ open, onOpenChange, onCreateBlock }: BlockDialogProps) {
    const form = useForm<z.infer<typeof blockFormSchema>>({
        resolver: zodResolver(blockFormSchema),
        defaultValues: {
            title: "",
        },
    });

    const handleSubmit = async (values: z.infer<typeof blockFormSchema>) => {
        await onCreateBlock(values.title);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#161616] border-2">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Create New Block</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Enter a name for your new block.
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
                        <Button type="submit">Create Block</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 