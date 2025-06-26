"use client";

import { useState, useEffect } from "react";
import { generateFAQAnswer } from "@/lib/faqGen";
import { fetchAllFAQs, FAQItem } from "@/lib/faqFetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "./ui/skeleton";
import { updatePoints } from "@/lib/blockFetch";

// Define the form schema
const formSchema = z.object({
    question: z.string().min(1, {
        message: "Question cannot be empty.",
    }).max(500, {
        message: "Question must be less than 500 characters.",
    }),
});

export default function FAQ({ blockId, text }: { blockId: string; text: string }) {
    const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Initialize the form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: "",
        },
    });

    // Fetch existing FAQs when component mounts
    useEffect(() => {
        const loadFAQs = async () => {
            try {
                const existingFAQs = await fetchAllFAQs(blockId);
                setFaqItems(existingFAQs);
            } catch (err) {
                console.error("Error loading FAQs:", err);
                setError("Failed to load existing FAQs");
            } finally {
                setIsInitialLoading(false);
            }
        };

        loadFAQs();
    }, [blockId]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        setError("");

        try {
            console.log("User asked question")
            await updatePoints(blockId, 5);
            const answer = await generateFAQAnswer(text, values.question, blockId);
            const newFAQ: FAQItem = {
                id: answer.id,
                question: values.question,
                answer: answer.answer,
                blockId: blockId
            };
            setFaqItems(prev => [...prev, newFAQ]);
            form.reset();
            
        } catch (err) {
            setError("Failed to generate answer. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-full mx-auto flex flex-col gap-4 h-[calc(100vh-2rem)]">
            <div className="space-y-6 overflow-y-auto flex-1 bg-[#292929] border-[#161616] border-8 px-4 py-4 rounded-3xl">
                <div className="leading-none">
                    <h2 className="text-2xl font-bold">FAQ</h2>
                    <p className="text-sm text-muted-foreground"> These are some things to remember personalized for you. </p>
                </div>
                {isInitialLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : (
                    faqItems.map((item) => (
                        <div key={item.id} className="border rounded-xl p-4 bg-[#161616]">
                            <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                            <p className="text-foreground">{item.answer}</p>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="border rounded-xl p-4 bg-[#161616]">
                        <h3 className="font-semibold text-lg mb-2">Q: {form.getValues("question")}</h3>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-4 w-[80%]" />
                        </div>
                    </div>
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                    <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex w-full items-center space-x-2">
                                        <Input 
                                            type="text" 
                                            {...field} 
                                            disabled={isLoading} 
                                            placeholder="Ask away..."
                                            className="flex-1 text-xl h-12"
                                        />
                                        <Button 
                                            type="submit" 
                                            disabled={isLoading}
                                            className="shrink-0 text-xl w-12 h-12"
                                        >
                                            {isLoading ? "○" : "->"}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>

            {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}
        </div>
    );
}



