import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TooltipWrapper } from "@/components/ui/TooltipWrapper";

interface ExamplesHeaderProps {
  isRegenerating: boolean;
  onRegenerate: () => void;
}

export default function ExamplesHeader({ isRegenerating, onRegenerate }: ExamplesHeaderProps) {
  return (
    <div className="leading-none flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold">Examples</h2>
        <p className="text-sm text-muted-foreground">
          Here are some examples to help you understand the concepts better.
        </p>
      </div>
      <TooltipWrapper text="Regenerate examples" side="bottom">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="h-10 w-10"
        >
          <RefreshCw className={`h-5 w-5 ${isRegenerating ? 'animate-spin' : ''}`} />
        </Button>
      </TooltipWrapper>
    </div>
  );
} 