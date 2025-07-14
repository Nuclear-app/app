import { Loading } from "../ui/loading";
import ExamplesHeader from "./ExamplesHeader";
import ExamplesGrid from "./ExamplesGrid";

interface Topic {
  id: string;
  name: string;
  examples: string[];
  blockId: string;
}

interface ExamplesContainerProps {
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
  isRegenerating: boolean;
  onRegenerate: () => void;
}

export default function ExamplesContainer({ 
  topics, 
  isLoading, 
  error, 
  isRegenerating, 
  onRegenerate 
}: ExamplesContainerProps) {
  return (
    <div className="w-3/5 mx-auto">
      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}
      <div className="space-y-6 overflow-y-auto flex-1 bg-[#221D1D] border-[#3C3535] border-8 px-4 py-4 rounded-3xl">
        <ExamplesHeader 
          isRegenerating={isRegenerating} 
          onRegenerate={onRegenerate} 
        />
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loading />
          </div>
        ) : (
          <ExamplesGrid topics={topics} />
        )}
      </div>
    </div>
  );
} 