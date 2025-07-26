'use client'
import { FlashCardArray } from "react-flashcards";
import { useState } from "react";

// Define the flashcard interface
interface FlashcardData {
  id: number;
  front: string | React.JSX.Element;
  back: string | React.JSX.Element;
  label: string | React.JSX.Element;
  timerDuration: number;
}

// Default deck with beautiful styling
const defaultDeck: FlashcardData[] = [
  {
    id: 1,
    front: "What is the capital of Alaska?",
    back: "Juneau - The capital and largest city of Alaska",
    label: "Geography",
    timerDuration: 0,
  },
  {
    id: 2,
    front: "What is the capital of California?",
    back: "Sacramento - The capital of the Golden State",
    label: "Geography",
    timerDuration: 0,
  },
  {
    id: 3,
    front: "What is the capital of Texas?",
    back: "Austin - The Live Music Capital of the World",
    label: "Geography",
    timerDuration: 0,
  },
];

interface FlashcardComponentProps {
  deck?: FlashcardData[];
  title?: string;
  className?: string;
}

export default function FlashcardComponent({
  deck = defaultDeck,
  title = "Geography Flashcards",
  className = ""
}: FlashcardComponentProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleCardChange = (id: number, index: number) => {
    setCurrentCardIndex(index);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">
          Card {currentCardIndex + 1} of {deck.length}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <FlashCardArray
          cards={deck}
          label={title}
          timerDuration={0}
          controls={true}
          showCount={true}
          onCardChange={handleCardChange}
          width="100%"
          styleOptions={{
            FlashcardArrayContainerControl: {
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '20px',
            },
            progressBarContainerStyle: {
              backgroundColor: '#e2e8f0',
              borderRadius: '8px',
              height: '8px',
            },
            progressFillStyle: {
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
            },
          }}
        />
      </div>

      <div className="mt-6 text-center">
        <div className="flex justify-center space-x-2">
          {deck.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentCardIndex
                  ? 'bg-blue-600'
                  : index < currentCardIndex
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}