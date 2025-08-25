"use client";
import React from "react"
import { Quiz } from "@/components/quizComponent/quiz";
import { useEffect, useState, use } from "react";
import { getFullContext } from "@/lib/context";
import { generateQuizzesIfNeeded } from "@/app/dashboard/block/[id]/actions";
import { BlockViewNav } from "@/components/blockViewNav";
import { Loading } from "@/components/ui/loading";

interface Props {
    params: Promise<{ id: string }>;
}

export default function QuizParent({ params }: Props) {
    const { id } = use(params);
    const [context, setContext] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadContext = async () => {
            if (!id) {
                console.error('No block ID provided');
                setIsLoading(false);
                return;
            }

            console.log('Loading context for block:', id);
            try {
                const blockContext = await getFullContext(id);
                console.log('Fetched context:', blockContext);
                setContext(blockContext || "");
            } catch (error) {
                console.error("Error loading context:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadContext();
    }, [id]);

    // Run bgFunction when quizzes page mounts to ensure quizzes are generated
    useEffect(() => {
        if (id) {
            console.log('Quizzes page mounted, running bgFunction for block:', id);
            generateQuizzesIfNeeded(id);
        }
    }, [id]);

    // Log whenever context changes
    useEffect(() => {
        console.log('Current context state:', context);
    }, [context]);    

    if (!id) {
        return <div>No block ID provided</div>;
    }

    if (isLoading) {
        return <div><Loading /></div>;
    }

    // Check if context is empty and show a nice message
    if (!context || context.trim() === "") {
        return (
            <div className="flex flex-col min-h-screen">
                <BlockViewNav blockId={id} />
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-2xl font-bold mb-3">
                            Let's try that again with some more info in your block!
                        </h2>
                        <p className="mb-6">
                            Add some content to your block first, then come back to generate quizzes.
                        </p>
                        <a 
                            href={`/dashboard/block/${id}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            ← Back to Block
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <BlockViewNav blockId={id} />
            <div className="flex flex-1 items-center justify-center">
                <Quiz blockId={id} />
            </div>            
        </div>
    );
}
