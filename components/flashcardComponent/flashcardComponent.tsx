'use client'
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";

// Define the flashcard interface
interface FlashcardData {
  id: number;
  front: string;
  back: string;
}

interface FlashcardComponentProps {
  deck: FlashcardData[];
  title?: string;
  className?: string;
  onCardComplete?: (cardId: number) => void;
  onCardIncomplete?: (cardId: number) => void;
  onCardViewed?: (cardId: number) => void;
  onCardNotViewed?: (cardId: number) => void;
  onCurrentCardChange?: (cardIndex: number) => void;
  completedCards?: Set<number>;
}

export default function FlashcardComponent({
  deck,
  className = "",
  onCardComplete,
  onCardIncomplete,
  onCardViewed,
  onCardNotViewed,
  onCurrentCardChange,
  completedCards = new Set()
}: FlashcardComponentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = deck[currentIndex];
  const isCurrentCardCompleted = completedCards.has(currentCard.id);

  // Notify parent of current card change
  useEffect(() => {
    if (onCurrentCardChange) {
      onCurrentCardChange(currentIndex);
    }
  }, [currentIndex, onCurrentCardChange]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      // Mark current card as viewed when moving to next
      if (onCardViewed) {
        onCardViewed(currentCard.id);
      }
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Mark current card as not viewed when going back
      if (onCardNotViewed) {
        onCardNotViewed(currentCard.id);
      }
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto p-6`}>
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Flashcard {currentIndex + 1} / {deck.length}
        </p>
      </div>

      {/* Flashcard with side navigation */}
      <div className="mb-6 flex items-center justify-between w-full">
        {/* Previous button */}
        <motion.button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          whileHover={{ scale: currentIndex === 0 ? 1 : 1.05 }}
          whileTap={{ scale: currentIndex === 0 ? 1 : 0.95 }}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
          `}
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </motion.button>

        {/* Flashcard */}
        <div className="relative flex-1 mx-2">
          <div
            onClick={handleFlip}
            className="relative w-full h-96 cursor-pointer"
          >
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="front"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: -180 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[#221d1d] rounded-lg shadow-lg p-6 flex items-center justify-center text-center"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {currentCard.front}
                    </h3>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: 180 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[#221d1d] rounded-lg shadow-lg p-6 flex items-center justify-center text-center"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div>
                    <h3 className="text-xl text-white text-left">
                      {currentCard.back}
                    </h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Next button */}
        <motion.button
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          whileHover={{ scale: currentIndex === deck.length - 1 ? 1 : 1.05 }}
          whileTap={{ scale: currentIndex === deck.length - 1 ? 1 : 0.95 }}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
          `}
        >
          <ArrowRightIcon className="w-4 h-4" />
        </motion.button>
      </div>

    </div>
  );
}