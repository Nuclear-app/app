'use client';

import { useEffect, useState, use } from "react";
import { getFullContext } from "@/lib/context";
import { generateFlashcardsIfNeeded, deleteFlashcards, getFlashcardsData, regenerateFlashcards } from "@/app/dashboard/block/[id]/actions";
import { BlockViewNav } from "@/components/blockViewNav";
import { Loading } from "@/components/ui/loading";
import FlashcardComponent from "@/components/flashcardComponent/flashcardComponent";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  blockId: string;
}

interface Props {
    params: Promise<{ id: string }>;
}

export default function FlashcardParent({ params }: Props) {
    const { id } = use(params);
    const [context, setContext] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
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

    // Run bgFunction when flashcards page mounts to ensure flashcards are generated
    useEffect(() => {
        if (id) {
            console.log('Flashcards page mounted, running bgFunction for block:', id);
            generateFlashcardsIfNeeded(id);
        }
    }, [id]);

    // Load flashcards
    useEffect(() => {
        const fetchFlashcards = async () => {
            if (!id) return;

            try {
                setIsLoadingFlashcards(true);
                const fetchedFlashcards = await getFlashcardsData(id);
                setFlashcards(fetchedFlashcards);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch flashcards');
            } finally {
                setIsLoadingFlashcards(false);
            }
        };

        fetchFlashcards();
    }, [id]);

    const handleRegenerate = async () => {
        if (!id || !context) return;

        setIsRegenerating(true);
        try {
            console.log('Regenerating flashcards for block:', id);
            await regenerateFlashcards(id, context);

            // Refresh the flashcards list
            const fetchedFlashcards = await getFlashcardsData(id);
            setFlashcards(fetchedFlashcards);

        } catch (error) {
            console.error('Error regenerating flashcards:', error);
            setError(error instanceof Error ? error.message : 'Failed to regenerate flashcards');
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

    // Transform flashcards to match the component's expected format
    const deck = flashcards.map((flashcard, index) => ({
        id: index + 1,
        front: flashcard.front,
        back: flashcard.back,
    }));

    return (
        <div className="flex flex-col gap-4">
            <BlockViewNav blockId={id} />

            {/* Header with regenerate button */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Flashcards</h1>
                <Button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
            </div>

            {/* Error state */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Loading state */}
            {isLoadingFlashcards && (
                <div className="flex justify-center items-center h-64">
                    <Loading />
                </div>
            )}

            {/* Flashcards component */}
            {!isLoadingFlashcards && !error && flashcards.length > 0 && (
                <FlashcardComponent
                    deck={deck}
                    title="Study Flashcards"
                    className="mt-4"
                />
            )}

            {/* Empty state */}
            {!isLoadingFlashcards && !error && flashcards.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No flashcards available yet.</p>
                    <p className="text-sm text-gray-500">Flashcards are being generated from your block content...</p>
                </div>
            )}
        </div>
    );
}