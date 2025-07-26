'use client'
import { FlashcardArray } from "react-quizlet-flashcard";
import "react-quizlet-flashcard/dist/index.css";

// Define the flashcard interface
interface Flashcard {
  id: number;
  front: { html: React.ReactNode };
  back: { html: React.ReactNode };
}

// Default deck
const defaultDeck: Flashcard[] = [
  {
    id: 1,
    front: { html: <div className="text-lg font-medium">What is the capital of Alaska?</div> },
    back: { html: <div className="text-lg font-medium text-green-600">Juneau</div> },
  },
  {
    id: 2,
    front: { html: <div className="text-lg font-medium">What is the capital of California?</div> },
    back: { html: <div className="text-lg font-medium text-green-600">Sacramento</div> },
  },
  {
    id: 3,
    front: { html: <div className="text-lg font-medium">What is the capital of Texas?</div> },
    back: { html: <div className="text-lg font-medium text-green-600">Austin</div> },
  },
];

interface FlashcardComponentProps {
  deck?: Flashcard[];
  title?: string;
  className?: string;
}

export default function FlashcardComponent({
  deck = defaultDeck,
  title = "Geography Flashcards",
  className = ""
}: FlashcardComponentProps) {
  return (
    <div className={`w-full max-w-2xl mx-auto p-4 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{title}</h2>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <FlashcardArray deck={deck} />
      </div>
    </div>
  );
}