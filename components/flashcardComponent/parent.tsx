'use client';

import { useEffect, useState, use } from "react";
import { getFullContext } from "@/lib/context";
import { generateFlashcardsIfNeeded, deleteFlashcards, getFlashcardsData, regenerateFlashcards } from "@/app/dashboard/block/[id]/actions";
import { BlockViewNav } from "@/components/blockViewNav";
import { Loading } from "@/components/ui/loading";
import FlashcardComponent from "@/components/flashcardComponent/flashcardComponent";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle } from "lucide-react";

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
    const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

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

    const handleCardComplete = (cardId: number) => {
        setCompletedCards(prev => new Set([...Array.from(prev), cardId]));
    };

    const handleCardIncomplete = (cardId: number) => {
        setCompletedCards(prev => {
            const newSet = new Set(Array.from(prev));
            newSet.delete(cardId);
            return newSet;
        });
    };

    const handleCardViewed = (cardId: number) => {
        setCompletedCards(prev => new Set([...Array.from(prev), cardId]));
    };

    const handleCardNotViewed = (cardId: number) => {
        setCompletedCards(prev => {
            const newSet = new Set(Array.from(prev));
            newSet.delete(cardId);
            return newSet;
        });
    };

    const handleCurrentCardChange = (cardIndex: number) => {
        setCurrentCardIndex(cardIndex);
    };

    // Log whenever context changes
    useEffect(() => {
        console.log('Current context state:', context);
    }, [context]);

    if (!id) {
        return (
            <BlockViewNav blockId={id as any}>
                <div>No block ID provided</div>
            </BlockViewNav>
        );
    }

    if (isLoading) {
        return (
            <BlockViewNav blockId={id}>
                <div className="flex justify-center items-center h-screen"><Loading /></div>
            </BlockViewNav>
        );
    }

    // Transform flashcards to match the component's expected format
    const deck = flashcards.map((flashcard, index) => ({
        id: index + 1,
        front: flashcard.front,
        back: flashcard.back,
    }));

    const totalCards = flashcards.length; //change to 10 if limit needed
    const completedCount = completedCards.size;
    // Calculate progress based on completed cards and current position
    const progressPercentage = totalCards > 0 ? ((completedCount + (completedCards.has(deck[currentCardIndex]?.id) ? 0 : 1)) / totalCards) * 100 : 0;

    return (
        <BlockViewNav blockId={id}>
            {/* Progress Section */}
            {totalCards > 0 && (
                <div className="bg-[#221d1d] rounded-full my-6">
                    <div
                        className="h-3 rounded-full transition-all duration-300 ease-out"
                        style={{
                            width: `${progressPercentage}%`,
                            backgroundColor: '#bf77f7'
                        }}
                    />
                </div>
            )}

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
                    className="mt-4"
                    onCardViewed={handleCardViewed}
                    onCardNotViewed={handleCardNotViewed}
                    onCurrentCardChange={handleCurrentCardChange}
                    completedCards={completedCards}
                />
            )}

            {/* Empty state */}
            {!isLoadingFlashcards && !error && flashcards.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No flashcards available yet.</p>
                    <p className="text-sm text-gray-500">Flashcards are being generated from your block content...</p>
                </div>
            )}
        </BlockViewNav>
    );
}