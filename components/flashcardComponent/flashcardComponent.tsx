'use client'
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { TooltipWrapper } from "@/components/ui/TooltipWrapper";

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for these keys to avoid page scrolling
      if (['Space', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case 'Space':
          handleFlip();
          break;
        case 'ArrowRight':
        case 'KeyD':
          handleNext();
          break;
        case 'ArrowLeft':
        case 'KeyA':
          handlePrevious();
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, isFlipped]); // Dependencies for the effect

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
  <div className="w-full mx-auto">
    {/* Progress Display */}
    <div className="text-center my-6">
      <p className="text-gray-600 mb-2">
        Flashcard {currentIndex + 1} / {deck.length}
      </p>
    </div>

    {/* Flashcard + Navigation Container */}
    <div className="flex w-full h-96">
      {/* Left Navigation Zone */}
      <motion.div
        onClick={currentIndex === 0 ? undefined : handlePrevious}
        whileHover={{ scale: currentIndex === 0 ? 1 : 1.01 }}
        whileTap={{ scale: currentIndex === 0 ? 1 : 0.98 }}
        className={`flex-[2.5] h-full flex items-center justify-center ${currentIndex === 0 ? '' : 'cursor-pointer'}`}
        aria-disabled={currentIndex === 0}
      >
        {currentIndex > 0 && (
          <TooltipWrapper text="Press left arrow key / A" side="bottom">
            <ArrowLeftIcon className="w-8 h-8 text-gray-400" />
          </TooltipWrapper>
        )}
      </motion.div>

      {/* Flashcard */}
      <div className="flex-[5] h-full relative flex items-center justify-center">
        <TooltipWrapper text="Press Space to flip" side="bottom">
          <div
            onClick={handleFlip}
            className="w-full h-[90%] cursor-pointer relative"
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
        </TooltipWrapper>
      </div>

      {/* Right Navigation Zone */}
      <motion.div
        onClick={currentIndex === deck.length - 1 ? undefined : handleNext}
        whileHover={{ scale: currentIndex === deck.length - 1 ? 1 : 1.01 }}
        whileTap={{ scale: currentIndex === deck.length - 1 ? 1 : 0.98 }}
        className={`flex-[2.5] h-full flex items-center justify-center ${currentIndex === deck.length - 1 ? '' : 'cursor-pointer'}`}
        aria-disabled={currentIndex === deck.length - 1}
      >
        {currentIndex < deck.length - 1 && (
          <TooltipWrapper text="Press right arrow key / D" side="bottom">
            <ArrowRightIcon className="w-8 h-8 text-gray-400" />
          </TooltipWrapper>
        )}
      </motion.div>
    </div>
  </div>

  );
}