"use client";
import React from "react";
import { defaultEditorContent } from "@/lib/content";
import {
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { useEffect, useRef, useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import LinkSelector from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import NodeSelector from "./selectors/node-selector";
import { Separator } from "@/components/ui/separator";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand } from "./slash-command";
import { updateBlock } from "@/app/actions/update-block";




const extensions = [...defaultExtensions, slashCommand];

interface AdvancedEditorProps {
  blockId?: string;
  initialContent?: JSONContent;
}

const AdvancedEditor = ({ blockId: initialBlockId, initialContent }: AdvancedEditorProps) => {
  const [content, setContent] = useState<JSONContent | null>(initialContent || null);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState<number>();
  const [currentBlockId, setCurrentBlockId] = useState<string | undefined>(initialBlockId);

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const editorRef = useRef<EditorInstance | null>(null);

  const handleSave = useCallback(async (editor: EditorInstance) => {
    if (!editor) return;

    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());
    
    // Ensure proper serialization before sending to server
    const serializedContent = JSON.parse(JSON.stringify(json));
    
    // Save to database using server action
    try {
      setSaveStatus("Saving...");
      const result = await updateBlock(serializedContent, currentBlockId || '');
      
      if (!result.success) {
        console.log(result.error);  
        throw new Error(result.error);
      }

      // Local storage backup
      window.localStorage.setItem("html-content", editor.getHTML());
      window.localStorage.setItem("novel-content", JSON.stringify(json));
      window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
      
      setSaveStatus("Saved");
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus("Error saving");
    }
  }, [currentBlockId, setSaveStatus, setCurrentBlockId]);

  const debouncedUpdates = useDebouncedCallback(handleSave, 2000);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);  // Prioritize server data
    } else {
      // Only use localStorage/default if no server data
      const localContent = window.localStorage.getItem("novel-content");
      if (localContent) setContent(JSON.parse(localContent));
      else setContent(defaultEditorContent);
    }
  }, [initialContent]);

  if (!content) return null;

  return (
    <div className="relative w-full max-w-screen-lg mx-auto h-[90vh] flex flex-col">
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus}</div>
        <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
          {charsCount} Words
        </div>
      </div>
      <EditorRoot>
        <EditorContent
          initialContent={content}
          extensions={extensions}
          className="relative p-4 w-full max-w-screen-lg bg-background sm:rounded-lg sm:shadow-lg h-full overflow-y-auto"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full min-h-full",
            },
          }}
          onUpdate={({ editor }) => {
            editorRef.current = editor;
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        />

        <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
          <Separator orientation="vertical" />
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <Separator orientation="vertical" />
          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
          <Separator orientation="vertical" />
          <MathSelector />
          <Separator orientation="vertical" />
          <TextButtons />
          <Separator orientation="vertical" />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
        </GenerativeMenuSwitch>
      </EditorRoot>
    </div>
  );
}

export default AdvancedEditor;