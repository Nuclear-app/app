"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fetchQuiz, updateMistake, updatePoints } from "@/lib/quizFetch"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  useEffect(() => {
    const loadQuizzes = async () => {
      const quizData = await fetchQuiz(blockId)
      setQuizzes(quizData)
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
      await updatePoints(blockId, 1)
    } else {
      await updateMistake(currentQuiz.id, answer)
    }
  }

  const handleNext = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
    } else {
      // Quiz completed
      router.push(`/block/${blockId}`)
    }
  }

  if (!currentQuiz) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Question {currentQuizIndex + 1} of {quizzes.length}</h2>
        <p className="text-sm text-gray-500">Score: {score}</p>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">{currentQuiz.question}</h3>
        <div className="space-y-3">
          {currentQuiz.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === option 
                ? (isCorrect ? "default" : "destructive")
                : "outline"}
              className="w-full justify-start"
              onClick={() => !selectedAnswer && handleAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              {option}
            </Button>
          ))}
        </div>
      </Card>

      {selectedAnswer && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            isCorrect ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
          }`}>
            <p className="font-medium">
              {isCorrect ? "Correct!" : "Incorrect!"}
            </p>
            {!isCorrect && (
              <p className="text-sm mt-2">
                Correct answer: {currentQuiz.correctAns}
              </p>
            )}
          </div>
          <Button 
            className="w-full"
            onClick={handleNext}
          >
            {currentQuizIndex < quizzes.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </div>
      )}
    </div>
  )
}
