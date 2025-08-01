'use client';

import { useEffect, useState, use } from "react";
import { getFullContext } from "@/lib/context";
import { generateExamplesIfNeeded, deleteExamples, getExamplesData, regenerateExamples } from "@/app/dashboard/block/[id]/actions";
import { BlockViewNav } from "@/components/blockViewNav";
import { Loading } from "@/components/ui/loading";
import ExamplesContainer from "@/components/exampleComponent/ExamplesContainer";

interface Topic {
  id: string;
  name: string;
  examples: string[];
  blockId: string;
}

interface Props {
    params: Promise<{ id: string }>;
}

export default function ExamplesParent({ params }: Props) {
    const { id } = use(params);
    const [context, setContext] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingExamples, setIsLoadingExamples] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [isRegenerating, setIsRegenerating] = useState(false);

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

    // Run bgFunction when examples page mounts to ensure examples are generated
    useEffect(() => {
        if (id) {
            console.log('Examples page mounted, running bgFunction for block:', id);
            generateExamplesIfNeeded(id);
        }
    }, [id]);

    // Load examples
    useEffect(() => {
        const fetchTopics = async () => {
            if (!id) return;
            
            try {
                setIsLoadingExamples(true);
                const fetchedTopics = await getExamplesData(id);
                setTopics(fetchedTopics);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch examples');
            } finally {
                setIsLoadingExamples(false);
            }
        };

        fetchTopics();
    }, [id]);

    const handleRegenerate = async () => {
        if (!id || !context) return;
        
        setIsRegenerating(true);
        try {
            console.log('Regenerating examples for block:', id);
            await regenerateExamples(id, context);
            
            // Refresh the topics list
            const fetchedTopics = await getExamplesData(id);
            setTopics(fetchedTopics);
            
        } catch (error) {
            console.error('Error regenerating examples:', error);
            setError(error instanceof Error ? error.message : 'Failed to regenerate examples');
        } finally {
            setIsRegenerating(false);
        }
    };

    // Log whenever context changes
    useEffect(() => {
        console.log('Current context state:', context);
    }, [context]);

    if (!id) {
        return <div>No block ID provided</div>;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loading /></div>;
    }

    // Check if context is empty and show a nice message
    if (!context || context.trim() === "") {
        return (
            <div className="flex flex-col gap-4">
                <BlockViewNav blockId={id} />
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-2xl font-bold mb-3">
                            Let's try that again with some more info in your block!
                        </h2>
                        <p className="mb-6">
                            Add some content to your block first, then come back to generate examples.
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
        <div className="flex flex-col gap-4">
            <BlockViewNav blockId={id} />
            <ExamplesContainer 
                topics={topics}
                isLoading={isLoadingExamples}
                error={error}
                isRegenerating={isRegenerating}
                onRegenerate={handleRegenerate}
            />
        </div>
    );
}
