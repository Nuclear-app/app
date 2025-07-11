// 'use client';

// import { useState } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Edit } from 'lucide-react';

// interface RenameDialogueProps {
//   type: 'block' | 'crate';
//   currentName: string;
//   id: string;
//   onRename: (id: string, newName: string) => Promise<void>;
//   trigger?: React.ReactNode;
// }

// export default function RenameDialogue({ 
//   type, 
//   currentName, 
//   id, 
//   onRename, 
//   trigger 
// }: RenameDialogueProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [newName, setNewName] = useState(currentName);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!newName.trim()) {
//       setError(`${type === 'block' ? 'Block' : 'Crate'} name cannot be empty`);
//       return;
//     }

//     if (newName.trim() === currentName) {
//       setIsOpen(false);
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       await onRename(id, newName.trim());
//       setIsOpen(false);
//       setNewName(newName.trim());
//     } catch (err) {
//       setError(err instanceof Error ? err.message : `Failed to rename ${type}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOpenChange = (open: boolean) => {
//     setIsOpen(open);
//     if (open) {
//       setNewName(currentName);
//       setError(null);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
//       <DialogTrigger asChild>
//         {trigger || (
//           <Button variant="ghost" size="sm" className="w-full justify-start">
//             <Edit className="h-4 w-4 mr-2" />
//             Rename
//           </Button>
//         )}
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Rename {type === 'block' ? 'Block' : 'Crate'}</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="name">Name</Label>
//             <Input
//               id="name"
//               value={newName}
//               onChange={(e) => setNewName(e.target.value)}
//               placeholder={`Enter ${type} name`}
//               disabled={isLoading}
//               autoFocus
//             />
//           </div>
//           {error && (
//             <div className="text-sm text-destructive">
//               {error}
//             </div>
//           )}
//           <div className="flex justify-end space-x-2">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => setIsOpen(false)}
//               disabled={isLoading}
//             >
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isLoading}>
//               {isLoading ? 'Renaming...' : 'Rename'}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
import React from "react";

interface RenameDialogueProps {
    type: 'block' | 'crate';
    currentName: string;
    id: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRename: (newTitle: string) => Promise<void>;
}

const blockFormSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }).max(50, {
        message: "Title must be less than 50 characters.",
    }),
});

export function RenameDialogue({ open, onOpenChange, onRename, currentName }: RenameDialogueProps) {
    const form = useForm<z.infer<typeof blockFormSchema>>({
        resolver: zodResolver(blockFormSchema),
        defaultValues: {
            title: currentName,
        },
    });

    // Reset form when dialog opens/closes or currentName changes
    React.useEffect(() => {
        if (open) {
            form.reset({ title: currentName });
        }
    }, [open, currentName, form]);

    const handleSubmit = async (values: z.infer<typeof blockFormSchema>) => {
        try {
            await onRename(values.title);
            onOpenChange(false); // Close the dialog after successful rename
            form.reset();
        } catch (error) {
            console.error("Failed to rename:", error);
            // Keep dialog open if there's an error
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#161616] border-2">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Rename Block</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Enter a new name for your block.
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
                                        <Input 
                                            {...field} 
                                            className="bg-[#292929] border rounded-md p-2" 
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    form.handleSubmit(handleSubmit)();
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Rename Block</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 