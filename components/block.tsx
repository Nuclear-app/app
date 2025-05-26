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

 export function Block() {
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
            <div className="w-full flex flex-row rounded-xl flex-1 bg-[#161616] items-center justify-center">Back Button</div>
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
                Points
              </span>
            </div>
          </div>
          <BentoCard
             name="Flashcards"
             description="Coming Soon..."
             Icon={Zap}
             background={null}
             href="#"
             cta="Let's Zap"
             className="col-span-1 row-span-1"
          />
          <BentoCard
             name="Nucleated Quizzes"
             description=""
             Icon={FishSymbol}
             background={null}
             href="#"
             cta="Quiz Yourself"
             className="col-span-1 row-span-1"
          />
          <BentoCard
             name="Upload Files"
             description=""
             Icon={Upload}
             background={null}
             href="#"
             cta="Upload Files"
             className="col-span-1 row-span-1"
          />
          <BentoCard
             name="Ask Nuclear"
             description=""
             Icon={Infinity}
             background={null}
             href="#"
             cta="For all your question needs"
             className="col-span-1 row-span-1"
          />
          <BentoCard
             name="Notes"
             description="Search through all your files in one place."
             Icon={FileTextIcon}
             background={null}
             href="#"
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
             href="#"
             cta="->"
             className="col-span-1 row-span-1"
          />
       </BentoGrid>
    )
 }