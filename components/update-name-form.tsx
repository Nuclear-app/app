"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ControllerRenderProps } from "react-hook-form"
import Link from "next/link"

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
                            <FormControl>
                                <div className="flex items-center space-x-2">
                                    <Input className="bg-foreground/80 text-background" {...field} type="text" placeholder="Name" />
                                    <Link href="/onboarding/name/study-type">
                                        <Button className="bg-background/80 text-foreground hover:bg-background/60" type="button">{"->"}</Button>
                                    </Link>
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