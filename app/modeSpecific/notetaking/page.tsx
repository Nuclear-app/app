'use client'
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getNoteContent } from './actions';
import { type JSONContent } from "novel";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";

function NotetakingContent() {
  const searchParams = useSearchParams();
  const blockId = searchParams.get('blockId');
  const [initialContent, setInitialContent] = useState<JSONContent | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      if (!blockId) return;

      try {
        const content = await getNoteContent(blockId);
        // Content will always be a valid JSON string from our server action
        if (typeof content === 'string') {
          const parsedContent = JSON.parse(content);
          if (typeof parsedContent === 'object' && parsedContent !== null) {
            setInitialContent(parsedContent as JSONContent);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load note content');
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [blockId]);

  if (!blockId) {
    return <div className="text-destructive">No block ID provided</div>;
  }

  if (isLoading) {
    return <div className="text-muted-foreground">Loading note content...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="p-4">
      <Link href={`/dashboard/block/${blockId}`}>
        <Button className="mb-4 bg-foreground text-background">
          <ArrowLeftIcon className="w-4 h-4" />
          Block
        </Button>
      </Link>
      <TailwindAdvancedEditor 
        blockId={blockId} 
        initialContent={initialContent}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotetakingContent />
    </Suspense>
  );
}
