import {
   BellIcon,
   CalendarIcon,
   FileTextIcon,
   GlobeIcon,
   InputIcon,

} from "@radix-ui/react-icons"

import { Zap, ScanSearch, Infinity, Upload, FishSymbol, Bone } from "lucide-react"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
import Flashcards from "@/public/flashcards.svg"
import { fetchPoints, fetchNotesAsText } from "@/lib/blockFetch"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import FileUpload, { FileState } from "@/components/fileUpload"


interface BlockProps {
   blockId: string;
}

export function Block({ blockId }: BlockProps) {
   const [points, setPoints] = useState<number>(0);
   const [notes, setNotes] = useState<string | null>(null);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      const getPoints = async () => {
         if (!blockId) return;
         const pts = await fetchPoints(blockId);
         setPoints(pts || 0);
      }
      getPoints();
   }, [blockId]);

   useEffect(() => {
      const getNotes = async () => {
         if (!blockId) return;
         const text = await fetchNotesAsText(blockId);
         setNotes(text);
      };
      getNotes();
   }, [blockId]);

   useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
   }, []);

   const handleFileUpload = (files: FileState[]) => {
      console.log('Uploaded files:', files);
      // Handle the uploaded files here
   };

   return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
         <div className="w-full  p-8">
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-4xl font-bold text-primary">Learning Block</h1>
               <Button onClick={() => setIsDialogOpen(true)}>Upload Files</Button>
            </div>

            {mounted && (
               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogContent className="sm:min-w-[425px]">
                     <DialogHeader>
                        <DialogTitle>Upload Files</DialogTitle>
                        <DialogDescription>
                           Upload your learning materials here. You can drag and drop files or click to browse.
                        </DialogDescription>
                     </DialogHeader>
                     <FileUpload returnFiles={handleFileUpload} mode="upload" blockId={blockId} newBlock={false} />
                  </DialogContent>
               </Dialog>
            )}

            <BentoGrid className="max-w-4xl mx-auto">
               <BentoCard
                  name="FAQ"
                  description="Search through all your files in one place."
                  Icon={Infinity}
                  background={null}
                  href={`/dashboard/block/${blockId}/faq`}
                  cta="->"
                  className="col-span-1 row-span-1"
               />
               <BentoCard
                  name="Notes"
                  description={notes || 'No notes yet'}
                  Icon={FileTextIcon}
                  background={null}
                  href={`/modeSpecific/notetaking?blockId=${blockId}`}
                  cta="Learn more"
                  className="col-span-2 row-span-2"
               />
               <BentoCard
                  name="To-do List"
                  description="Search through all your files in one place."
                  Icon={FileTextIcon}
                  background={null}
                  href="#"
                  cta="Learn more"
                  className="col-span-1 row-span-2"
               />
               <BentoCard
                  name="Examples"
                  description=""
                  Icon={ScanSearch}
                  background={null}
                  href={`/dashboard/block/${blockId}/examples`}
                  cta="->"
                  className="col-span-1 row-span-1"
               />
            </BentoGrid>
         </div>
      </div>
   );
}