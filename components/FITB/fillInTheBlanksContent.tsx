'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createFillInTheBlanks, deleteFillInTheBlanks } from '@/app/modeSpecific/fillInTheBlanks/actions';
import { ProgressBar } from '@/components/FITB/progressBar';
import { FillInBlankQuestion } from '@/components/FITB/fillInBlankQuestion';
import { FillInBlankQuestion as FillInBlankQuestionType, AnswerState } from '@/components/FITB/types';
import { Pothole } from '@/components/FITB/pothole';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';

// Confetti component
const Confetti = () => {
  const colors = ['bg-[#00D3BE]', 'bg-[#FF6B6B]', 'bg-[#4ECDC4]', 'bg-[#45B7D1]', 'bg-[#96CEB4]', 'bg-[#FFEAA7]'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${colors[Math.floor(Math.random() * colors.length)]}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          initial={{ y: -10, x: 0, rotate: 0 }}
          animate={{
            y: window.innerHeight + 10,
            x: Math.random() * 200 - 100,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            ease: "easeOut",
            delay: Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  );
};

export function FillInTheBlanksContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const blockId = searchParams.get('blockId');
    const [questions, setQuestions] = useState<FillInBlankQuestionType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answerStates, setAnswerStates] = useState<AnswerState>({});
    const [activePotholeIndex, setActivePotholeIndex] = useState<number | null>(0);
    const [potholeHeight, setPotholeHeight] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

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

    const handleBlankClick = (index: number) => {
        setActivePotholeIndex(index);
    };

    const handlePotholeAnswer = (questionId: string, isCorrect: boolean) => {
        setAnswerStates(prev => ({
            ...prev,
            [questionId]: isCorrect
        }));
        if (isCorrect) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            
            const idx = questions.findIndex(q => q.id === questionId);
            if (idx !== -1 && idx < questions.length - 1) {
                setActivePotholeIndex(idx + 1);
            } else {
                setActivePotholeIndex(null);
            }
        }
    };

    // Calculate progress for the progress bar
    const correctAnswers = Object.values(answerStates).filter(state => state === true).length;
    const totalBlanks = questions.length;

    if (!blockId) {
        return <div className="text-destructive">Block ID is required</div>;
    }

    return (
        <>
            <AnimatePresence>
                {showConfetti && <Confetti />}
            </AnimatePresence>
            <div className="container mx-auto p-6 space-y-6" style={{ paddingBottom: `${Math.max(96, potholeHeight + 32)}px` }}>
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
                                {questions.map((question, index) => {
                                    const parts = question.sentence.split("_____");
                                    const beforeBlank = parts[0];
                                    const afterBlank = parts[1] || "";
                                    return (
                                        <span key={question.id}>
                                            {beforeBlank}
                                            {answerStates[question.id] ? (
                                                <span className="inline-block mx-1">{question.answer}</span>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    className="inline-block mx-1 px-0 py-0 border-b border-dotted border-black bg-transparent hover:bg-transparent text-inherit shadow-none rounded-none focus:outline-none"
                                                    disabled={!!answerStates[question.id]}
                                                    onClick={() => handleBlankClick(index)}
                                                >
                                                    {'_____'}
                                                </Button>
                                            )}
                                            {afterBlank}
                                            {index < questions.length - 1 ? ' ' : ''}
                                        </span>
                                    );
                                })}
                            </p>
                        </div>
                        <AnimatePresence mode="wait">
                          {activePotholeIndex !== null && questions[activePotholeIndex] && !answerStates[questions[activePotholeIndex].id] && (
                            <motion.div
                              key={`pothole-${activePotholeIndex}`}
                              initial={{ opacity: 0, y: 50, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 50, scale: 0.95 }}
                              transition={{ 
                                type: "spring", 
                                stiffness: 300, 
                                damping: 30,
                                duration: 0.1
                              }}
                            >
                              <Pothole
                                title={`Pothole #${activePotholeIndex + 1}`}
                                question={<FillInBlankQuestion
                                  key={questions[activePotholeIndex].id}
                                  sentence={questions[activePotholeIndex].sentence}
                                  answer={questions[activePotholeIndex].answer}
                                  hint={questions[activePotholeIndex].hint || undefined}
                                  onAnswerChange={(_, isCorrect) => handlePotholeAnswer(questions[activePotholeIndex].id, isCorrect)}
                                  autoFocus
                                />}
                                hint={questions[activePotholeIndex].hint || undefined}
                                onHeightChange={setPotholeHeight}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </>
    );
} 