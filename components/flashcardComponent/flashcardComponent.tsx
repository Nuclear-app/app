'use client'
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Define the flashcard interface
interface FlashcardData {
  id: number;
  front: string;
  back: string;
}

// Default deck
const defaultDeck: FlashcardData[] = [
  {
    id: 1,
    front: "What is the capital of Alaska?",
    back: "Juneau",
  },
  {
    id: 2,
    front: "What is the capital of California?",
    back: "Sacramento",
  },
  {
    id: 3,
    front: "What is the capital of Texas?",
    back: "Austin",
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = deck[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 ${className}`}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">
          Card {currentIndex + 1} of {deck.length}
        </p>
      </div>

      {/* Flashcard */}
      <div className="mb-6">
        <div
          onClick={handleFlip}
          className="relative w-full h-64 cursor-pointer"
        >
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="front"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: -180 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 bg-white rounded-lg shadow-lg p-6 flex items-center justify-center text-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {currentCard.front}
                  </h3>
                  <p className="text-sm text-gray-600">Click to flip</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: 180 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 flex items-center justify-center text-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div>
                  <h3 className="text-xl font-semibold text-indigo-800 mb-2">
                    {currentCard.back}
                  </h3>
                  <p className="text-sm text-indigo-600">Click to flip back</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <motion.button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          whileHover={{ scale: currentIndex === 0 ? 1 : 1.05 }}
          whileTap={{ scale: currentIndex === 0 ? 1 : 0.95 }}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${currentIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          ← Previous
        </motion.button>

        <div className="flex space-x-1">
          {deck.map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${index === currentIndex
                  ? 'bg-blue-600'
                  : index < currentIndex
                  ? 'bg-green-500'
                  : 'bg-gray-300'
                }
              `}
            />
          ))}
        </div>

        <motion.button
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          whileHover={{ scale: currentIndex === deck.length - 1 ? 1 : 1.05 }}
          whileTap={{ scale: currentIndex === deck.length - 1 ? 1 : 0.95 }}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${currentIndex === deck.length - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          Next →
        </motion.button>
      </div>
    </div>
  );
}