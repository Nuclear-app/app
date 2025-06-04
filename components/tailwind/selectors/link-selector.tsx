import { Button } from "../ui/button";
import { PopoverContent } from "@/components/tailwind/ui/popover";

import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Check, Trash } from "lucide-react";
import { useEditor } from "novel";
import { useEffect, useRef, useState, Fragment } from "react";
import { ny } from "@/lib/utils";
import { Input } from "../../ui/input";
import { Link2, Unlink } from "lucide-react";
import { EditorBubble } from "novel";

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_e) {
    return false;
  }
}
export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (_e) {
    return null;
  }
}
interface LinkSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LinkSelector = ({ open, onOpenChange }: LinkSelectorProps) => {
  const { editor } = useEditor();
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
      setUrl("");
      onOpenChange(false);
    }
  };

  return (
    <EditorBubble
      tippyOptions={{
        placement: "bottom",
        onHidden: () => {
          onOpenChange(false);
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
    >
      {open && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
          <Input
            ref={inputRef}
            type="url"
            placeholder="Enter URL..."
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            className="h-8 w-[200px]"
          />
          <Button size="sm" type="submit" className="h-8">
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => {
              editor?.chain().focus().unsetLink().run();
              if (inputRef.current) {
                inputRef.current.value = "";
              }
              onOpenChange(false);
            }}
          >
            <Unlink className="h-4 w-4" />
          </Button>
        </form>
      )}
      {!open && (
        <Fragment>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 rounded-none text-purple-500"
            onClick={() => onOpenChange(true)}
          >
            <Link2 className="h-4 w-4" />
            Add Link
          </Button>
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default LinkSelector;
