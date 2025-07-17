'use client';

import { useEffect, useState, use } from "react";
import { getFullContext } from "@/lib/context";
import { generateExamplesIfNeeded, deleteExamples, getExamplesData } from "@/app/dashboard/block/[id]/actions";
import { BlockViewNav } from "@/components/blockViewNav";
import { Loading } from "@/components/ui/loading";
import ExamplesContainer from "@/components/exampleComponent/ExamplesContainer";
import { generateExamples } from "@/lib/examplesPerplexity";

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
        if (!id) return;
        
        setIsRegenerating(true);
        try {
            await deleteExamples(id);
            console.log('Regenerating examples for block:', id);
            await generateExamples(context, id);
            
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
