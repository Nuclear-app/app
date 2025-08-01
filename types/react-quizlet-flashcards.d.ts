declare module 'react-quizlet-flashcard' {
    import { ReactNode } from 'react';

    export interface Flashcard {
      id: number;
      front: { html: ReactNode };
      back: { html: ReactNode };
    }

    export interface FlashcardArrayProps {
      deck: Flashcard[];
      style?: React.CSSProperties;
      className?: string;
    }

    export const FlashcardArray: React.FC<FlashcardArrayProps>;
  }