import Topic from "@/components/exampleComponent/topic";

interface Topic {
  id: string;
  name: string;
  examples: string[];
  blockId: string;
}

interface ExamplesGridProps {
  topics: Topic[];
}

export default function ExamplesGrid({ topics }: ExamplesGridProps) {
  return (
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
  );
} 