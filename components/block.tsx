import {
    BellIcon,
    CalendarIcon,
    FileTextIcon,
    GlobeIcon,
    InputIcon,

 } from "@radix-ui/react-icons"

 import { Zap, ScanSearch, Infinity, Upload, FishSymbol, Bone} from "lucide-react"
 import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
 import Flashcards from "@/public/flashcards.svg"
import { fetchPoints, fetchNotesAsText } from "@/lib/blockFetch"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"


interface BlockProps {
    blockId: string;
}

 export function Block({ blockId }: BlockProps) {
    const [points, setPoints] = useState<number>(0);
    const [notes, setNotes] = useState<string | null>(null);
    useEffect(() => {
        const getPoints = async () => {
            if (!blockId) return;
            const pts = await fetchPoints(blockId);
            setPoints(pts);
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

    return (
       <BentoGrid className="gap-4 grid-cols-4 grid-rows-3">
          {/* <BentoCard
             name="points and back button"
             description="We automatically save your files as you type."
             Icon={FileTextIcon}
             background={null}
             href="#"
             cta="Learn more"
             className="col-span-1 row-span-1"
          /> */}
          <div className="col-span-1 row-span-1 flex flex-col gap-4 h-full">
            <Link className="w-full flex flex-row rounded-xl flex-1 bg-[#161616] items-center justify-center" href={`/dashboard`}>
            {/* <div>Back Button</div> */}
            <Button className="w-full flex flex-row rounded-xl flex-1 bg-[#161616] items-center justify-center">Back Button</Button>
            </Link>
            <div
              className="w-full rounded-xl flex-1 flex flex-row items-center justify-center relative overflow-hidden"
              style={{
                backgroundImage: "url('/pointsBg.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="relative z-10 text-black text-2xl font-bold flex items-center gap-2">
                <Bone className="w-6 h-6" />
                {points}
              </span>
            </div>
          </div>
          <BentoCard
             name="Flashcards"
             description="Coming Soon..."
             Icon={Zap}
             background={null}
             href={`/dashboard/block/${blockId}/flashcards`}
             cta="->"
             className="col-span-1 row-span-1"
          />
          <BentoCard
             name="Nucleated Quizzes"
             description=""
             Icon={FishSymbol}
             background={null}
             href={`/dashboard/block/${blockId}/quizzes`}
             cta="->"
             className="col-span-1 row-span-1"
          />
          <BentoCard
             name="Upload Files"
             description=""
             Icon={Upload}
             background={null}
             href={`/modeSpecific/fileInput?blockId=${blockId}`}
             cta="->"
             className="col-span-1 row-span-1"
          />
          <BentoCard
             name="Ask Nuclear"
             description=""
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
    )
 }