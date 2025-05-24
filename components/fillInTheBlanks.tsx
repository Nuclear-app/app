'use client';

import { useState } from 'react';

interface Question {
  sentence: string;
  answer: string;
  hint: string;
}

interface FillInTheBlanksProps {
  blockID: string;
}

export default function FillInTheBlanks({ blockID }: FillInTheBlanksProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const response = await fetch('/api/fill-in-blank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockId: blockID,
          text: 'Sample text', // Replace with actual text from your application
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      if (data.success) {
        setQuestions(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={handleGenerateQuestions}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Fill-in-the-Blank Questions'}
      </button>

      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}

      {questions.length > 0 && (
        <div className="mt-4 space-y-4">
          <h2 className="text-xl font-semibold">Generated Questions:</h2>
          {questions.map((question, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{question.sentence}</p>
              <p className="text-sm text-gray-600 mt-1">Hint: {question.hint}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}