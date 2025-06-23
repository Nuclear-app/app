'use client'

import { Input } from "@/components/ui/input";
import { ny } from "@/lib/utils";
import { useState } from "react";

interface FillInBlankQuestionProps {
    sentence: string;
    answer: string;
    hint?: string;
    onAnswerChange?: (answer: string, isCorrect: boolean) => void;
    className?: string;
}

export function FillInBlankQuestion({
    sentence,
    answer,
    hint,
    onAnswerChange,
    className,
}: FillInBlankQuestionProps) {
    const [userAnswer, setUserAnswer] = useState("");
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // Split the sentence into three parts: before blank, blank, and after blank
    const parts = sentence.split("_____");
    const beforeBlank = parts[0];
    const afterBlank = parts[1] || "";

    const handleAnswerChange = (value: string) => {
        setUserAnswer(value);
        
        const isAnswerCorrect = value.trim().toLowerCase() === answer.trim().toLowerCase();    
        setIsCorrect(isAnswerCorrect);
        onAnswerChange?.(value, isAnswerCorrect);
    };

    return (
        <span className={ny("inline", className)}>
            {beforeBlank}
            <div className="relative inline-block mx-1">
                <Input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder=""
                    style={{
                        width: `${Math.max(answer.length + 2, 4)}ch`, // 2 extra chars, min 4ch
                        minWidth: '4ch',
                        maxWidth: '100%',
                    }}
                    className={ny(
                        "h-7 text-base inline-block align-middle bg-transparent border-0 border-b-2 px-1 py-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0",
                        isCorrect === true && "border-b-green-500",
                        isCorrect === false && "border-b-red-500",
                        isCorrect === null && "border-b-gray-300"
                    )}
                />
                {/* {hint && (
                    <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground whitespace-nowrap">
                        Hint: {hint}
                    </div>
                )} */}
            </div>
            {afterBlank}
        </span>
    );
} 