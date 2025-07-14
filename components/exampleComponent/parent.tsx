'use client';

import { useEffect, useState, use } from "react";
import { getFullContext } from "@/lib/context";
import { generateExamplesIfNeeded, deleteExamples } from "@/app/dashboard/block/[id]/actions";
import { BlockViewNav } from "@/components/blockViewNav";
import { getExamples, generateExamples } from "@/lib/examplesPerplexity";
import Topic from "../topic";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Loading } from "../ui/loading";

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
                const fetchedTopics = await getExamples(id);
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
            const fetchedTopics = await getExamples(id);
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
            <div className="w-3/5 mx-auto">
                {error && (
                    <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg">
                        {error}
                    </div>
                )}
                <div className="space-y-6 overflow-y-auto flex-1 bg-[#221D1D] border-[#3C3535] border-8 px-4 py-4 rounded-3xl">
                    <div className="leading-none flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Examples</h2>
                            <p className="text-sm text-muted-foreground">Here are some examples to help you understand the concepts better.</p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                            className="h-10 w-10"
                        >
                            <RefreshCw className={`h-5 w-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    {isLoadingExamples ? (
                        <div className="flex justify-center items-center h-32">
                            <Loading />
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-4">
                                {topics.filter((_, index) => index % 2 === 0).map((topic) => (
                                    <Topic 
                                        key={topic.id}
                                        topicName={topic.name}
                                        examples={topic.examples}
                                    />
                                ))}
                            </div>
                            <div className="flex-1 space-y-4">
                                {topics.filter((_, index) => index % 2 === 1).map((topic) => (
                                    <Topic 
                                        key={topic.id}
                                        topicName={topic.name}
                                        examples={topic.examples}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
