'use client';

import { useState } from 'react';

interface Topic {
  id: string;
  name: string;
  examples: string[];
  blockId: string;
}

interface ExamplesProps {
  blockID: string;
  text: string;
}

export default function Examples({ blockID, text }: ExamplesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  const handleGenerateExamples = async () => {
    setIsLoading(true);
    setError(null);
    setTopics([]);

    try {
      const response = await fetch('/api/examples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockId: blockID,
          text: text, // Replace with actual text from your application
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate examples');
      }

      if (data.success) {
        setTopics(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate examples');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        onClick={handleGenerateExamples}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Examples'}
      </button>

      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}

      {topics.length > 0 && (
        <div className="mt-4 space-y-4">
          <h2 className="text-xl font-semibold">Generated Topics and Examples:</h2>
          {topics.map((topic) => (
            <div key={topic.id} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-lg">{topic.name}</h3>
              <ul className="mt-2 space-y-2">
                {topic.examples.map((example, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 