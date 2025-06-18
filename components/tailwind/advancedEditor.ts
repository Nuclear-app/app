"use client"

import { EditorInstance, JSONContent, StarterKit } from "novel";
import { useCallback } from "react";
import { updateBlock } from "@/app/actions/update-block";
import { generateHTML } from "@tiptap/html";

interface SaveContentParams {
  blockId: string | undefined;
  content: JSONContent;
  setSaveStatus: (status: string) => void;
  setCurrentBlockId: (id: string) => void;
}

export async function saveContent({ blockId, content, setSaveStatus, setCurrentBlockId }: SaveContentParams) {
  try {
    console.log("Saving content...");
    const result = await updateBlock(content, blockId);
    
    if (!result.success) {
      setSaveStatus("Error saving");
      const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to save content';
      console.error('Error saving content:', errorMessage);
      return;
    }

    if (result.isNewBlock && result.data?.id) {
      setCurrentBlockId(result.data.id);
    }

    setSaveStatus("Saved");
  } catch (error) {
    setSaveStatus("Error saving");
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error saving content:', errorMessage);
  }
}

