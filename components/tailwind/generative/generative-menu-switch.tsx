import { EditorBubble, removeAIHighlight, useEditor } from "novel";
import { Fragment, type ReactNode, useEffect, useState, Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import Magic from "../ui/icons/magic";
import AISelector from "./ai-selector";

interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

const GenerativeMenuSwitch = ({ children, open, onOpenChange }: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  useEffect(() => {
    if (!open && editor) {
      removeAIHighlight(editor);
    }
  }, [open, editor]);

  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
    >
      {open && (
        <AISelector
          onSelect={(value, option) => {
            // Handle selection
          }}
          onCompletion={(completion) => {
            // Handle completion
          }}
          onDiscard={() => {
            onOpenChange(false);
          }}
        />
      )}
      {!open && (
        <Fragment>
          <Button
            className="gap-1 rounded-none text-purple-500"
            variant="ghost"
            onClick={() => onOpenChange(true)}
            size="sm"
          >
            <Magic className="h-4 w-4" />
            Ask AI
          </Button>
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
