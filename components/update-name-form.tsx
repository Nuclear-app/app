"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ControllerRenderProps } from "react-hook-form"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
})

type FormSchema = z.infer<typeof formSchema>

interface UpdateNameFormProps {
    onSubmit: (data: FormSchema) => Promise<void>
    defaultName?: string | null
}

export function UpdateNameForm({ onSubmit, defaultName }: UpdateNameFormProps) {
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultName || "",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }: { field: ControllerRenderProps<FormSchema, "name"> }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-2">
                                    <Input type="text" placeholder="Name" />
                                    <Button type="submit">-></Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
} 