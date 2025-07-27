import FlashcardParent from "@/components/flashcardComponent/parent";

export default function FlashcardsPage({ params }: { params: Promise<{ id: string }> }) {
    return <FlashcardParent params={params} />;
}