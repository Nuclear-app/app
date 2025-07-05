"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { generateTutorResponse, TutorResponse } from "@/lib/tutor/initalGen"

const formSchema = z.object({
  question: z.string().min(1, "Please enter something")
})

type FormData = z.infer<typeof formSchema>

export default function TutorMain({ blockId }: { blockId: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [response, setResponse] = useState<TutorResponse | null>(null)
    const [question, setQuestion] = useState("")
    const [skippedLessons, setSkippedLessons] = useState<Set<number>>(new Set())

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: ""
        }
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        setQuestion(data.question)
        
        try {
            const tutorResponse = await generateTutorResponse(data.question, blockId)
            setResponse(tutorResponse)
        } catch (error) {
            console.error("Error getting tutor response:", error)
            setResponse({
                isValid: false,
                errorMessage: error instanceof Error ? error.message : "An unknown error occurred"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleNewQuestion = () => {
        setResponse(null)
        setQuestion("")
        setSkippedLessons(new Set())
        form.reset()
    }

    const handleLessonToggle = (lessonOrder: number, checked: boolean) => {
        const newSkipped = new Set(skippedLessons)
        if (checked) {
            newSkipped.add(lessonOrder)
        } else {
            newSkipped.delete(lessonOrder)
        }
        setSkippedLessons(newSkipped)
    }

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-8 text-center">Tutor</h1>
                <div className="text-center">
                    <div className="text-lg mb-4">Thinking about your question...</div>
                    <div>"{question}"</div>
                </div>
            </div>
        )
    }

    if (response) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-8 text-center">Tutor</h1>
                
                <div className="mb-6">
                    <h2 className=" p-3 rounded-lg">"{question}"</h2>
                </div>

                {!response.isValid ? (
                    <div className=" border border-red-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold mb-2">Question Not Related to Study Materials</h3>
                        <p>{response.errorMessage}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold mb-3">Answer:</h3>
                            <p className="leading-relaxed">{response.answer}</p>
                        </div>

                        {response.lessonPlan && response.lessonPlan.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold">Learning Path</h3>
                                    <span className="text-sm opacity-70">
                                        {response.lessonPlan.length - skippedLessons.size} of {response.lessonPlan.length} lessons
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {response.lessonPlan.map((lesson, index) => {
                                        const isSkipped = skippedLessons.has(lesson.order)
                                        return (
                                            <div 
                                                key={index} 
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                                    isSkipped 
                                                        ? 'opacity-50' 
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium">
                                                        ↪
                                                        </span>
                                                        <h4 className={`font-medium truncate ${
                                                            isSkipped ? 'line-through' : ''
                                                        }`}>
                                                            {lesson.title}
                                                        </h4>
                                                    </div>
                                                    <p className={`text-sm opacity-70 ${
                                                        isSkipped ? 'line-through' : ''
                                                    }`}>
                                                        {lesson.description}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleLessonToggle(lesson.order, !isSkipped)}
                                                    className="flex-shrink-0 text-xs px-3 py-1 bg-gray-700 rounded-md"
                                                >
                                                    {isSkipped ? "Include" : "Skip X"}
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <Button 
                    onClick={handleNewQuestion}
                    className="w-full mt-8"
                    variant="outline"
                >
                    Ask Another Question
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-center">Tutor</h1>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg font-medium">
                                    What's on your mind?
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ask me anything..."
                                        className="text-lg p-4"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Thinking..." : "Ask Question"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}