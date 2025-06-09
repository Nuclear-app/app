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
import { iconMap } from "@/lib/types";

interface CrateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateCrate: (title: string, icon: string) => Promise<void>;
}

const crateFormSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }).max(50, {
        message: "Title must be less than 50 characters.",
    }),
    icon: z.string(),
});

export function CrateDialog({ open, onOpenChange, onCreateCrate }: CrateDialogProps) {
    const form = useForm<z.infer<typeof crateFormSchema>>({
        resolver: zodResolver(crateFormSchema),
        defaultValues: {
            title: "",
            icon: "blocks",
        },
    });

    const handleSubmit = async (values: z.infer<typeof crateFormSchema>) => {
        await onCreateCrate(values.title, values.icon);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#161616] border-2">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Create New Crate</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Choose an icon and name for your new crate.
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
    );
} 