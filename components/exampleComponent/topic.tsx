import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Button } from '../ui/button';

interface TopicProps {
  topicName: string;
  examples: string[];
}

export default function Topic({ topicName, examples }: TopicProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-md p-4 bg-[#3C3535] space-y-2 col-span-1"
    >
      <div className="">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-between items-center">
            <h3 className="font-Bold text-[16px] break-words whitespace-normal overflow-wrap-anywhere max-w-full">{topicName}</h3>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <ol className="list-decimal list-inside space-y-2">
          {examples.map((example, index) => (
            <li key={index} className="text-gray-300">
              {example}
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}