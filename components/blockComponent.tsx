'use client'
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getNoteContent } from '@/app/dashboard/block/[id]/actions';
import { useEffect, useState, Suspense, useRef } from 'react';
import { type JSONContent } from "novel";
import { BlockViewNav } from "@/components/blockViewNav";
import { updatePoints } from "@/lib/blockFetch";
import { Loading } from "./ui/loading";

function BlockContent() {
  const params = useParams();
  const router = useRouter();
  const blockId = params.id as string;
  const [initialContent, setInitialContent] = useState<JSONContent | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const pointsUpdatedRef = useRef(false);

  // Check ownership first
  useEffect(() => {
    async function checkOwnership() {
      try {
        const response = await fetch('/api/auth/check-block-ownership', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blockId }),
        });
        
        if (!response.ok) {
          console.error('Ownership check failed:', response.status);
          router.push('/dashboard');
          return;
        }
        
        const result = await response.json();
        if (!result.hasAccess) {
          console.log('User does not have access to this block');
          router.push('/dashboard');
          return;
        }
        
        setHasAccess(true);
      } catch (error) {
        console.error('Error checking ownership:', error);
        router.push('/dashboard');
      }
    }

    if (blockId) {
      checkOwnership();
    }
  }, [blockId, router]);

  useEffect(() => {
    if (!pointsUpdatedRef.current && mode && hasAccess) {
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
  }, [mode, blockId, hasAccess]);

  useEffect(() => {
    async function fetchContent() {
      if (!blockId || !hasAccess) return;

      console.log(`BlockComponent: Fetching content for block ${blockId}`);
      
      try {
        const content = await getNoteContent(blockId);
        console.log(`BlockComponent: Received content for block ${blockId}:`, typeof content);
        
        // Content will always be a valid JSON string from our server action
        if (typeof content === 'string') {
          const parsedContent = JSON.parse(content);
          console.log(`BlockComponent: Parsed content for block ${blockId}:`, parsedContent);
          
          if (typeof parsedContent === 'object' && parsedContent !== null) {
            setInitialContent(parsedContent as JSONContent);
          } else {
            console.error(`BlockComponent: Invalid parsed content for block ${blockId}:`, parsedContent);
            setError('Invalid content format received from server');
          }
        } else {
          console.error(`BlockComponent: Unexpected content type for block ${blockId}:`, typeof content);
          setError('Unexpected content type received from server');
        }
      } catch (err) {
        console.error(`BlockComponent: Error fetching content for block ${blockId}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load note content');
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [blockId, hasAccess]);

  const handleEditorFocus = () => {
    setIsTyping(true);
  };

  const handleEditorBlur = () => {
    setIsTyping(false);
  };

  if (!blockId) {
    return <div className="text-destructive">No block ID provided</div>;
  }

  if (hasAccess === null) {
    return <div className="flex justify-center items-center h-screen"><Loading /></div>;
  }

  if (hasAccess === false) {
    return <div className="text-destructive">Access denied</div>;
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loading /></div>;
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

export default function BlockComponent() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loading /></div>}>
      <BlockContent />
    </Suspense>
  );
}
