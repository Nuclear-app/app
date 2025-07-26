"use client"
import React, { useState } from "react"
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
import { ArrowRight, Loader2 } from "lucide-react"

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
    const [isLoading, setIsLoading] = useState(false)
    
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultName || "",
        },
    })

    const handleSubmit = async (data: FormSchema) => {
        setIsLoading(true)
        try {
            await onSubmit(data)
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleArrowClick = async () => {
        const isValid = await form.trigger()
        if (!isValid) {
            return
        }

        const formData = form.getValues()
        await handleSubmit(formData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }: { field: ControllerRenderProps<FormSchema, "name"> }) => (
                        <FormItem>
                            <FormControl>
                                <div className="flex items-center space-x-2">
                                    <Input 
                                        className="bg-foreground/80 text-background" 
                                        {...field} 
                                        type="text" 
                                        placeholder="Name"
                                        disabled={isLoading}
                                    />
                                    <Button 
                                        className="bg-background/80 text-foreground hover:bg-background/60" 
                                        type="button"
                                        onClick={handleArrowClick}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ArrowRight className="h-4 w-4" />
                                        )}
                                    </Button>
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