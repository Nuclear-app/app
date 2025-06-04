"use client";

import { Command, CommandInput } from "@/components/tailwind/ui/command";
import { useCompletion } from "ai/react";
import { useEditor } from "novel";
import { addAIHighlight } from "novel";
import AISelectorCommands from "./ai-selector-commands";
import AICompletionCommands from "./ai-completion-command";
import { useState } from "react";
import Magic from "../ui/icons/magic";
import { ScrollArea } from "../ui/scroll-area";
import { Editor } from "@tiptap/core";

interface AISelectorProps {
  onSelect: (value: string, option: string) => void;
  onCompletion: (completion: string) => void;
  onDiscard: () => void;
}

const AISelector = ({ onSelect, onCompletion, onDiscard }: AISelectorProps) => {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");

  const { completion, complete } = useCompletion({
    api: "/api/generate",
    onResponse: (response) => {
      if (response.status === 429) {
        // Handle rate limiting
        return;
      }
    },
    onFinish: (completion) => {
      onCompletion(completion);
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue) {
        complete(inputValue);
      }
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleHighlight = () => {
    if (!editor) return;
    const selection = editor.state.selection;
    addAIHighlight(editor);
  };

  return (
    <Command className="relative rounded-lg border shadow-md">
      <div className="flex items-center border-b px-3">
        <Magic className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder="Ask AI to edit or generate..."
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          value={inputValue}
          onValueChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <ScrollArea className="h-[300px] overflow-hidden p-0">
        {completion ? (
          <AICompletionCommands
            completion={completion}
            onDiscard={onDiscard}
          />
        ) : (
          <AISelectorCommands onSelect={onSelect} />
        )}
      </ScrollArea>
    </Command>
  );
};

export default AISelector;
