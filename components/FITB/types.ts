export interface FillInBlankQuestion {
    id: string;
    sentence: string;
    answer: string;
    hint: string | null;
    blockId: string;
}

export interface AnswerState {
    [key: string]: boolean;
} 