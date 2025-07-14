"use client";
import { Quiz } from "@/components/quizComponent/quiz";
import { useEffect, useState, use } from "react";
import { getFullContext } from "@/lib/context";
import { generateQuizzesIfNeeded } from "@/app/dashboard/block/[id]/actions";
import { BlockViewNav } from "@/components/blockViewNav";

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
        return <div>Loading context...</div>;
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
