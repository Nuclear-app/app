import { Skeleton } from "@/components/ui/skeleton";
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
  // Create skeleton items for loading state (6 items, 2 columns)
  const skeletonItems = Array.from({ length: 6 }, (_, i) => (
    <Skeleton
      key={`skeleton-${i}`}
      className="rounded-md p-4 bg-[#3C3535] space-y-2 col-span-1 min-h-[56px] w-full animate-pulse"
    />
  ));

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {skeletonItems}
          </div>
        ) : (
          <ExamplesGrid topics={topics} />
        )}
      </div>
    </div>
  );
} 