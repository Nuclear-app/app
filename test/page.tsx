"use client";

import { FillInBlank } from "@/components/fill-in-blank";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({});

  const handleAnswerChange = (answer: string, isCorrect: boolean, questionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: isCorrect
    }));
  };

  useEffect(() => {
    // Check if all answers are correct
    const allCorrect = Object.values(answers).every(isCorrect => isCorrect);
    if (allCorrect && Object.keys(answers).length === 3) { // Only navigate if all 3 questions are answered
      // Add a small delay to show the correct state before navigating
      console.log("allCorrect", allCorrect);
      const timer = setTimeout(() => {
        router.push('/test/result'); // Replace with your actual next page route
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [answers, router]);

  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed">
        <FillInBlank
          sentence="The process of photosynthesis converts sunlight into _____ energy."
          answer="chemical"
          hint="This type of energy is stored in chemical bonds of glucose"
          onAnswerChange={(answer, isCorrect) => handleAnswerChange(answer, isCorrect, 'q1')}
        />
        {" "}
        <FillInBlank 
          sentence="The _____ is the powerhouse of the cell."
          answer="mitochondria"
          hint="This organelle produces most of the cell's ATP"
          onAnswerChange={(answer, isCorrect) => handleAnswerChange(answer, isCorrect, 'q2')}
        />
        {" "}
        <FillInBlank
          sentence="Water molecules are made up of two hydrogen atoms and one _____ atom."
          answer="oxygen"
          hint="This element is essential for breathing"
          onAnswerChange={(answer, isCorrect) => handleAnswerChange(answer, isCorrect, 'q3')}
        />
        {" "}These are fundamental concepts in biology that help us understand how living organisms function.
      </p>
    </div>
  );
} 