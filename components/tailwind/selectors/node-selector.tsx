import { useEditor } from "novel";
import { Button } from "../ui/button";
import { Command, CommandGroup, CommandItem } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown, Code, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Type } from "lucide-react";
import { Editor } from "@tiptap/core";
import { type LucideIcon } from "lucide-react";

export type SelectorItem = {
  name: string;
  icon: LucideIcon;
  command: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
};

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const items: SelectorItem[] = [
  {
    name: "Text",
    icon: Type,
    command: (editor: Editor) => editor.chain().focus().clearNodes().run(),
    isActive: (editor: Editor) =>
      editor.isActive("paragraph") && !editor.isActive("bulletList") && !editor.isActive("orderedList"),
  },
  {
    name: "Heading 1",
    icon: Heading1,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: Heading2,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: Heading3,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    name: "Bullet List",
    icon: List,
    command: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor: Editor) => editor.isActive("bulletList"),
  },
  {
    name: "Numbered List",
    icon: ListOrdered,
    command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor: Editor) => editor.isActive("orderedList"),
  },
  {
    name: "Quote",
    icon: Quote,
    command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor: Editor) => editor.isActive("blockquote"),
  },
  {
    name: "Code",
    icon: Code,
    command: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor: Editor) => editor.isActive("codeBlock"),
  },
];

const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();

  if (!editor) return null;

  const activeItem = items.find((item) => item.isActive(editor));

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {activeItem?.name || "Select block type"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandGroup>
            {items.map((item) => (
              <CommandItem
                key={item.name}
                onSelect={() => {
                  item.command(editor);
                  onOpenChange(false);
                }}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {item.isActive(editor) && <Check className="ml-auto h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default NodeSelector;
