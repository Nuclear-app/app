'use client'

import SelectStudyType from "@/components/select-study-type"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import sandbox from "@/public/sandbox-study-type.svg"
import campaign from "@/public/campaign-study-type.svg"
import story from "@/public/story-study-type.svg"
import { createInitialBlock } from "@/app/actions/create-initial-block"

export default function StudyTypePage() {
  const router = useRouter();

  const handleModeSelect = async (mode: 'sandbox' | 'campaign' | 'story', path: string) => {
    if (mode === 'campaign' || mode === 'story') {
      localStorage.setItem('selectedMode', mode);
    }

    try {
      const result = await createInitialBlock(mode);
      if (!result.success || !result.data) {
        console.error('Failed to create initial block:', result.error);
        return;
      }
      
      // For sandbox mode, add the block ID to the notetaking URL
      // For other modes, add it to the file input URL
      if (mode === 'sandbox') {
        router.push(`${path}?blockId=${result.data.id}`);
      } else {
        router.push(`${path}?blockId=${result.data.id}`);
      }
    } catch (error) {
      console.error('Error creating initial block:', error);
    }
  };

  return (
    <div className="
    border rounded-3xl w-11/12 container flex items-center justify-center min-h-screen py-12 w-full
    bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-green-600/40 via-purple-600/40 to-orange-600/40 bg-black/50 p-6 md:p-10">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-5xl text-center">How do you want to use Nuclear?</CardTitle>
        </CardHeader>
        <CardContent className="w-3/4 flex flex-col md:flex-row justify-center gap-6 mx-auto">
          <SelectStudyType 
            image={sandbox}
            title="Deathmarch"
            description="I have some things in my mind, and I want to start notetaking right away."
            onClick={() => handleModeSelect('sandbox', '/modeSpecific/notetaking')} />
          <SelectStudyType 
            image={campaign}
            title="Story & Sword"
            description="I have some resources, but I need help to actually learn them."
            onClick={() => handleModeSelect('campaign', '/modeSpecific/fileInput')} />
          <SelectStudyType 
            image={story}
            title="Just the Story"
            description="I just want to dump everything I have and have summaries made for me."
            onClick={() => handleModeSelect('story', '/modeSpecific/fileInput')} />
        </CardContent>
        <CardFooter className="flex justify-center">
            <div>
            {"Want to just explore Nuclear? "}
            <Link className="text-foreground underline" href="#">Click here</Link>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
} 