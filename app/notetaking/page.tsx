'use client'
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { Button } from "@/components/tailwind/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/tailwind/ui/dialog";
import Menu from "@/components/tailwind/ui/menu";
import { ScrollArea } from "@/components/tailwind/ui/scroll-area";
import Link from "next/link";

type JSONContent = any;

export default function EditorPage() {
   const handleContentChange = (content: JSONContent) => {
     // e.g., update local state / send to server / log
     console.log("New editor content:", content);
   };
 
   return (
     <div className="p-4">
       <TailwindAdvancedEditor
         returnContent={(content) => handleContentChange(content)}
       />
     </div>
   );
 }
