'use client';
import { useState, useEffect } from "react";
import { getExamples } from "@/lib/examplesPerplexity";
import Topic from "./topic";

interface Topic {
  id: string;
  name: string;
  examples: string[];
  blockId: string;
}

interface ExamplesProps {
  blockID: string;
}

export default function Examples({ blockID }: ExamplesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        const fetchedTopics = await getExamples(blockID);
        setTopics(fetchedTopics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch examples');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [blockID]);

  if (isLoading) {
    return <div className="text-center">Loading examples...</div>;
  }

  return (
    <div className="w-full mx-auto">
      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}
      <div className="space-y-6 overflow-y-auto flex-1 pr-2 bg-[#292929] border-[#161616] border-8 px-4 py-4 rounded-xl">
        <div className="leading-none">
          <h2 className="text-2xl font-bold mb-4">Examples</h2>
          <p className="text-sm text-muted-foreground">Here are some examples to help you understand the concepts better.</p>
        </div>
        <div className="space grid grid-cols-1 gap-2 md:grid-cols-2">
          {topics.map((topic) => (
            <Topic 
              key={topic.id}
              topicName={topic.name}
              examples={topic.examples}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
