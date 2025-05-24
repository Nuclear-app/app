"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ResultPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Congratulations! 🎉</h1>
        
        <p className="text-xl mb-8">
          You've successfully completed the biology quiz! Your understanding of fundamental biological concepts is impressive.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Score</h2>
          <p className="text-5xl font-bold text-green-600 mb-2">100%</p>
          <p className="text-gray-600">Perfect score! You answered all questions correctly.</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push("/test")}
            variant="outline"
            className="mr-4"
          >
            Try Again
          </Button>
          
          <Button
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
