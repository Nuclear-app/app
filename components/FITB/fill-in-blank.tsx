'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createFillInTheBlanks, deleteFillInTheBlanks } from '@/app/modeSpecific/fillInTheBlanks/actions';
import { ProgressBar } from '@/components/FITB/ProgressBar';
import { FillInBlankQuestion } from '@/components/FITB/FillInBlankQuestion';
import { FillInBlankQuestion as FillInBlankQuestionType, AnswerState } from '@/components/FITB/types';

export function FillInTheBlanksContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const blockId = searchParams.get('blockId');
    const [questions, setQuestions] = useState<FillInBlankQuestionType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answerStates, setAnswerStates] = useState<AnswerState>({});

    useEffect(() => {
        async function generateQuestions() {
            if (!blockId) return;
            
            try {
                await deleteFillInTheBlanks(blockId);
                const newQuestions = await createFillInTheBlanks(blockId);
                setQuestions(newQuestions);
                // Initialize answer states
                const initialStates = newQuestions.reduce((acc, q) => ({
                    ...acc,
                    [q.id]: false
                }), {});
                setAnswerStates(initialStates);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to generate questions');
            } finally {
                setIsLoading(false);
            }
        }

        generateQuestions();
    }, [blockId]);

    useEffect(() => {
        // Check if all answers are correct
        const allCorrect = Object.values(answerStates).every(state => state === true);
        if (allCorrect && Object.keys(answerStates).length > 0) {
            // Navigate back to block page after a short delay
            const timer = setTimeout(() => {
                router.push(`/dashboard/block/${blockId}`);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [answerStates, blockId, router]);

    const handleAnswerChange = (questionId: string, isCorrect: boolean) => {
        setAnswerStates(prev => ({
            ...prev,
            [questionId]: isCorrect
        }));
    };

    const correctAnswers = Object.values(answerStates).filter(state => state === true).length;
    const totalBlanks = questions.length;

    if (!blockId) {
        return <div className="text-destructive">Block ID is required</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {isLoading ? (
                <div className="text-muted-foreground">Generating questions...</div>
            ) : error ? (
                <div className="text-destructive">
                    {error}
                </div>
            ) : (
                <div>
                    <ProgressBar correctAnswers={correctAnswers} totalBlanks={totalBlanks} />
                    <div className="prose dark:prose-invert max-w-none px-12 sm:px-24 md:px-32 lg:px-48 xl:px-64">
                        <p className="leading-relaxed">
                            {questions.map((question, index) => (
                                <span key={question.id}>
                                    <FillInBlankQuestion
                                        sentence={question.sentence}
                                        answer={question.answer}
                                        hint={question.hint || undefined}
                                        onAnswerChange={(_, isCorrect) => handleAnswerChange(question.id, isCorrect)}
                                    />
                                    {index < questions.length - 1 ? ' ' : ''}
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
} 