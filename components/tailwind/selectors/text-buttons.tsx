import { Button } from "@/components/tailwind/ui/button";

import { BoldIcon, CodeIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";
import type { SelectorItem } from "./node-selector";
import { ny } from "@/lib/utils";

const items: SelectorItem[] = [
  {
    name: "Bold",
    icon: BoldIcon,
    command: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
  },
  {
    name: "Italic",
    icon: ItalicIcon,
    command: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
  },
  {
    name: "Underline",
    icon: UnderlineIcon,
    command: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive("underline"),
  },
  {
    name: "Strikethrough",
    icon: StrikethroughIcon,
    command: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
  },
  {
    name: "Code",
    icon: CodeIcon,
    command: (editor) => editor.chain().focus().toggleCode().run(),
    isActive: (editor) => editor.isActive("code"),
  },
];

export function TextButtons() {
  const { editor } = useEditor();

  if (!editor) return null;

  return (
    <div className="flex items-center gap-1">
      {items.map((item) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={() => item.command(editor)}
          className={ny(
            "flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent",
            item.isActive(editor) && "bg-accent"
          )}
        >
          <item.icon className="h-4 w-4" />
        </EditorBubbleItem>
      ))}
    </div>
  );
}
