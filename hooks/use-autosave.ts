import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useToast } from "@/hooks/use-toast"

interface UseAutosaveProps {
  data: any;
  onSave: (data: any) => Promise<void>;
  debounceMs?: number;
}

export function useAutosave({ data, onSave, debounceMs = 2000 }: UseAutosaveProps) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [debouncedData] = useDebounce(data, debounceMs, { leading: true });
  const { toast } = useToast();

  const save = useCallback(async () => {
    try {
      setStatus('saving');
      await onSave(debouncedData);
      setStatus('saved');
      toast({
        title: "Saved",
        description: "Your changes have been saved."
      });
    } catch (error) {
      setStatus('error');
      toast({
        title: "Error",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive"
      });
    }
  }, [debouncedData, onSave, toast]);

  useEffect(() => {
    if (debouncedData) {
      save();
    }
  }, [debouncedData, save]);

  return { status };
} 