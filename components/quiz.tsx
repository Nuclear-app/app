"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fetchQuiz, updateMistake, updatePoints } from "@/lib/quizFetch"
import { useRouter } from "next/navigation"
import Image from "next/image"
import sad from "@/public/quizJonas/sad.svg"
import happy from "@/public/quizJonas/happy.svg"

interface QuizProps {
    blockId: string
}

interface Quiz {
    id: string
    question: string
    correctAns: string
    options: string[]
    mistake: string | null
    blockId: string
    topicId: string | null
    used: boolean
}

export function Quiz({ blockId }: QuizProps) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [score, setScore] = useState(0)
    const [lastQuestionPoints, setLastQuestionPoints] = useState<number>(0)
    const router = useRouter()

    useEffect(() => {
        const loadQuizzes = async () => {
            const quizData = await fetchQuiz(blockId)
            setQuizzes(quizData as Quiz[])
        }
        loadQuizzes()
    }, [blockId])

    const currentQuiz = quizzes[currentQuizIndex]

    const handleAnswer = async (answer: string) => {
        setSelectedAnswer(answer)
        const correct = answer === currentQuiz.correctAns
        setIsCorrect(correct)

        if (correct) {
            setScore(prev => prev + 1)
            setLastQuestionPoints(20)
            await updatePoints(blockId, 20)
        } else {
            setLastQuestionPoints(-10)
            await updateMistake(currentQuiz.id, answer)
            await updatePoints(blockId, -10)
        }
    }

    const handleNext = () => {
        if (currentQuizIndex < quizzes.length - 1) {
            setCurrentQuizIndex(prev => prev + 1)
            setSelectedAnswer(null)
            setIsCorrect(null)
            setLastQuestionPoints(0)
        } else {
            router.push(`/dashboard/block/${blockId}`)
        }
    }

    if (!currentQuiz) {
        return <div>Loading...</div>
    }

    return (
        <div className="h-screen p-4 grid grid-cols-3 gap-4 grid-rows-3">
            {/* Main content - takes 3 columns */}
            <div className="col-span-2 row-span-3 rounded-xl border-8 border-[#161616] bg-[#292929] p-4">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-2">Quiz</h2>
                    <p className="text-sm text-gray-500">Test your knowledge {score}</p>
                </div>

                <Card className="bg-[#292929]">
                    <h3 className="text-xl rounded-xl bg-[#161616] font-semibold mb-4 p-2">{currentQuiz.question}</h3>
                    <p className="text-xl pb-2 text-bold">Choose</p>
                    <div className="space-y-2">
                        {currentQuiz.options.map((option, index) => (
                            <Button
                                key={index}
                                variant={selectedAnswer === option
                                    ? (isCorrect ? "default" : "destructive")
                                    : "outline"}
                                className="w-full p-5 justify-start rounded-xl bg-[#161616] hover:bg-[#161616]/80"
                                onClick={() => !selectedAnswer && handleAnswer(option)}
                                disabled={selectedAnswer !== null}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                </Card>

                {selectedAnswer && (
                    <div className="space-y-4 mt-4">
                        {/* <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}>
                            <p className="font-medium">
                                {isCorrect ? "Correct!" : "Incorrect!"}
                            </p>
                            {!isCorrect && (
                                <p className="text-sm mt-2">
                                    Correct answer: {currentQuiz.correctAns}
                                </p>
                            )}
                        </div> */}
                        <Button className="w-full" onClick={handleNext}>
                            {currentQuizIndex < quizzes.length - 1 ? "Next Question" : "Finish Quiz"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Top right card - takes 1 column */}
            <Card className="bg-[#292929] row-span-1 p-4 flex flex-col items-center justify-center">
                <h3 className="text-xl font-semibold mb-2">Points</h3>
                {selectedAnswer && (
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl">
                            {lastQuestionPoints > 0 ? '📈' : lastQuestionPoints < 0 ? '📉' : ''}
                        </span>
                        <span className={`text-2xl font-bold ${
                            lastQuestionPoints > 0 ? 'text-green-500' : 
                            lastQuestionPoints < 0 ? 'text-red-500' : 
                            'text-gray-400'
                        }`}>
                            {lastQuestionPoints > 0 ? `+${lastQuestionPoints}` : lastQuestionPoints}
                        </span>
                    </div>
                )}
            </Card>

            {/* Bottom right card - takes 1 column */}
            <Card className="bg-[#292929] row-span-2 p-4 flex flex-col justify-between">
                {selectedAnswer && (
                    <div className="flex flex-col gap-2">
                        <span className={`text-xl font-bold`}>
                            {isCorrect 
                                ? <><span className="text-green-500 font-extrabold">{selectedAnswer}</span> is the correct answer!</>
                                : <><span className="text-red-500 font-extrabold">{selectedAnswer}</span> is not the correct answer. The correct answer is <span className="text-green-500 font-extrabold">{currentQuiz.correctAns}</span></>
                            }
                        </span>
                    </div>
                )}
                <div className="flex justify-end">
                    <Image 
                        src={isCorrect ? happy : sad} 
                        alt="Correct" 
                        className="w-3/4 h-3/4"
                    />
                </div>
            </Card>
        </div>
    )
}
