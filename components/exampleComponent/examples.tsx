'use client';
import { useState, useEffect } from "react";
import { getExamples } from "@/lib/examplesPerplexity";
import Topic from "../topic";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { generateExamples } from "@/lib/examplesPerplexity";
import { getFullContext } from "@/lib/context";
import { Loading } from "../ui/loading";
import { deleteExamples } from "@/app/dashboard/block/[id]/actions";

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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const context = getFullContext(blockID);

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

  const handleRegenerate = async () => { //
    if (!blockID) return;
    
    setIsRegenerating(true);
    try {
        await deleteExamples(blockID);
        console.log('Regenerating examples for block:', blockID);
        await generateExamples(await context, blockID);
        
        // Refresh the topics list instead of full page reload
        const fetchedTopics = await getExamples(blockID);
        setTopics(fetchedTopics);
        
    } catch (error) {
        console.error('Error regenerating examples:', error);
        setError(error instanceof Error ? error.message : 'Failed to regenerate examples');
    } finally {
        setIsRegenerating(false);
    }
};

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loading /></div>;
  }

  return (
    <div className="w-3/5 mx-auto">
      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}
      <div className="space-y-6 overflow-y-auto flex-1 bg-[#221D1D] border-[#3C3535] border-8 px-4 py-4 rounded-3xl">
        <div className="leading-none flex justify-between items-start">
          <div>
          <h2 className="text-2xl font-bold">Examples</h2>
          <p className="text-sm text-muted-foreground">Here are some examples to help you understand the concepts better.</p>
        </div>
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="h-10 w-10"
                >
                    <RefreshCw className={`h-5 w-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                </Button>
          </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-4">
            {topics.filter((_, index) => index % 2 === 0).map((topic) => (
              <Topic 
                key={topic.id}
                topicName={topic.name}
                examples={topic.examples}
              />
            ))}
          </div>
          <div className="flex-1 space-y-4">
            {topics.filter((_, index) => index % 2 === 1).map((topic) => (
              <Topic 
                key={topic.id}
                topicName={topic.name}
                examples={topic.examples}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
