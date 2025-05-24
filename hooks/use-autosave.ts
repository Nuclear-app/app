import { useCallback, useEffect, useRef } from 'react';
import { JSONContent } from '@tiptap/react';
import { useDebounce } from 'use-debounce';
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

interface UseAutosaveProps {
  content: JSONContent | null;
  blockId: string;
  onSave?: () => void;
}

export function useAutosave({ content, blockId, onSave }: UseAutosaveProps) {
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [debouncedContent] = useDebounce(content, 2000); // Wait 2 seconds after last change

  const saveContent = useCallback(async () => {
    if (!debouncedContent) return;

    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Note: debouncedContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      onSave?.();
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  }, [debouncedContent, blockId, onSave, toast]);

  useEffect(() => {
    if (debouncedContent) {
      saveContent();
    }
  }, [debouncedContent, saveContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving: !!saveTimeoutRef.current,
  };
} 