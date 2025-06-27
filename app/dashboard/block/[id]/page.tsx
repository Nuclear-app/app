'use client'
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { useParams, useSearchParams } from 'next/navigation';
import { bgFunction, getNoteContent } from './actions';
import { useEffect, useState, Suspense, useRef } from 'react';
import { type JSONContent } from "novel";
import { BlockViewNav } from "@/components/blockViewNav";
import { updatePoints } from "@/lib/blockFetch";


function BlockPage() {
  const params = useParams();
  const blockId = params.id as string;
  const [initialContent, setInitialContent] = useState<JSONContent | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const searchParams = useSearchParams();
  const fromFileInput = searchParams.get('fromFileInput');
  const mode = searchParams.get('mode');

  const pointsUpdatedRef = useRef(false);

  useEffect(() => {
    if (fromFileInput === "true") {
      bgFunction(blockId);
    }
  }, [fromFileInput, blockId])

  useEffect(() => {
    if (!pointsUpdatedRef.current && mode) {
      if (mode === 'sandbox') {
        updatePoints(blockId, 20);
      } else if (mode === 'campaign') {
        updatePoints(blockId, 10);
      } else if (mode === 'story') {
        console.log("Story mode chosen, why isn't this working?");
        updatePoints(blockId, 20);
      }
      pointsUpdatedRef.current = true;
    }
  }, [mode, blockId]);

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

  const handleEditorFocus = () => {
    setIsTyping(true);
  };

  const handleEditorBlur = () => {
    setIsTyping(false);
  };

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
    <div className="flex flex-col gap-4">
      <BlockViewNav blockId={blockId} />
      <div 
        onFocus={handleEditorFocus}
        onBlur={handleEditorBlur}
        className="w-full"
      >
        <TailwindAdvancedEditor 
          blockId={blockId} 
          initialContent={initialContent}
        />
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlockPage />
    </Suspense>
  );
}
