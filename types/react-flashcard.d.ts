declare module 'react-flashcards' {
  import React from 'react';

  interface FlashCard {
    id: number;
    front: string | React.JSX.Element;
    back: string | React.JSX.Element;
    label: string | React.JSX.Element;
    timerDuration: number;
    isMarkdown?: boolean;
    frontStyle?: React.CSSProperties;
    frontContentStyle?: React.CSSProperties;
    backStyle?: React.CSSProperties;
    backContentStyle?: React.CSSProperties;
    className?: string;
    height?: string;
    borderRadius?: string;
    style?: React.CSSProperties;
    width?: string;
    showBookMark?: boolean;
    showTextToSpeech?: boolean;
  }

  interface FlashCardArrayProps {
    cards: FlashCard[];
    label: string | React.JSX.Element;
    timerDuration: number;
    autoPlay?: boolean;
    flipped?: boolean;
    controls?: boolean;
    isMarkdown?: boolean;
    showCount?: boolean;
    isFlap?: boolean;
    frontStyle?: React.CSSProperties;
    frontContentStyle?: React.CSSProperties;
    backStyle?: React.CSSProperties;
    backContentStyle?: React.CSSProperties;
    FlashcardArrayStyle?: React.CSSProperties;
    onCardChange?: (id: number, index: number) => void;
    onCardFlip?: (id: any, index: number, state: boolean) => void;
    width?: string;
    cycle?: boolean;
    styleOptions?: {
      FlashcardArrayContainerControl?: React.CSSProperties;
      progressBarContainerStyle?: React.CSSProperties;
      progressFillStyle?: React.CSSProperties;
    };
    forwardRef?: React.MutableRefObject<{
      nextCard: () => void;
      prevCard: () => void;
      resetArray: () => void;
    }> | null;
    currentCardFlipRef?: React.MutableRefObject<() => void>;
  }

  export const FlashCardArray: React.FC<FlashCardArrayProps>;
  export const FlashCard: React.FC<any>;
} 