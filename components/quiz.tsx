"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fetchQuiz, updateMistake} from "@/lib/quizFetch"
import { updatePoints } from "@/lib/blockFetch"
import { useRouter } from "next/navigation"
import Image from "next/image"
import sad from "@/public/quizJonas/sad.svg"
import happy from "@/public/quizJonas/happy.svg"
import neutral from "@/public/quizJonas/neutral.svg"

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

    // Arrays of motivational messages
    const correctMessages = [
        "You got that right!",
        "Excellent work!",
        "Perfect answer!",
        "You're on fire!",
        "Brilliant!",
        "That's the way!",
        "You nailed it!",
        "Outstanding!",
        "Great job!",
        "You're crushing it!"
    ]

    const wrongMessages = [
        "Wrong don't give up",
        "Keep trying!",
        "Don't worry, you'll get it!",
        "Almost there!",
        "You're learning!",
        "Next time for sure!",
        "Stay positive!",
        "You've got this!",
        "Keep going!",
        "Learning is a journey!"
    ]

    // Function to get random message from array
    const getRandomMessage = (messages: string[]) => {
        return messages[Math.floor(Math.random() * messages.length)]
    }

    const randomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

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
            await updatePoints(blockId, randomNumber(5, 10))
        } else {
            setLastQuestionPoints(-10)
            await updateMistake(currentQuiz.id, answer)
            await updatePoints(blockId, randomNumber(-5, 0))
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
        <div className="h-5/6 flex flex-col items-center justify-center">
            {/* Main content - takes 3 columns */}
            
            <div className="rounded-xl  p-4 w-3/4 md:w-1/2 ">
                <div className="mb-8">
                    <div className="w-full bg-[#221D1D] rounded-full h-6">
                        <div 
                            className="bg-[#00D3BE] h-6 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <Card className="p-6 rounded-3xl bg-[#221D1D]">
                    <h3 className="text-2xl rounded-3xl font-black mb-4 p-2">{currentQuiz.question}</h3>
                    <div className="space-y-4">
                        {currentQuiz.options.map((option, index) => {
                            let buttonVariant: "link" | "outline" | "default" | "destructive" | "secondary" | "ghost" = "outline";
                            let buttonClassName = "w-full p-12 justify-start rounded-xl bg-[#3C3535] text-wrap hover:bg-[#3C3535]/80";
                            
                            if (selectedAnswer) {
                                if (option === currentQuiz.correctAns) {
                                    // Correct answer - always green
                                    buttonVariant = "default";
                                    buttonClassName = "w-full p-12 justify-start rounded-xl bg-green-600 text-wrap hover:bg-green-600/80";
                                } else if (selectedAnswer === option && !isCorrect) {
                                    // Wrong selected answer - red
                                    buttonVariant = "destructive";
                                    buttonClassName = "w-full p-12 justify-start rounded-xl bg-red-600 text-wrap hover:bg-red-600/80";
                                }
                            } else if (selectedAnswer === option) {
                                // User's selection before checking
                                buttonVariant = isCorrect ? "default" : "destructive";
                                buttonClassName = "w-full p-12 justify-start rounded-xl bg-[#3C3535] text-wrap hover:bg-[#3C3535]/80";
                            }
                            
                            return (
                                <Button
                                    key={index}
                                    variant={buttonVariant}
                                    className={buttonClassName}
                                    onClick={() => !selectedAnswer && handleAnswer(option)}
                                    disabled={selectedAnswer !== null}
                                >
                                    {option}
                                </Button>
                            );
                        })}
                    </div>
                </Card>

                {selectedAnswer && (
                    <div className="space-y-8 mt-8">
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
                        <Button className="w-full p-8 h-12 rounded-3xl font-black text-2xl" onClick={handleNext}>
                            {currentQuizIndex < quizzes.length - 1 
                                ? (isCorrect ? getRandomMessage(correctMessages) : getRandomMessage(wrongMessages))
                                : "All done! Go to the block"
                            }
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
