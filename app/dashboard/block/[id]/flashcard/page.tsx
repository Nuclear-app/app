import FlashcardsComponent from "@/components/flashcardComponent/flashcardComponent";

export default function FlashcardsPage({ params }: { params: Promise<{ id: string }> }) {
    return <FlashcardsComponent/>;
}