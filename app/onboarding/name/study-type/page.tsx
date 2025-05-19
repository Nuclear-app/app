import SelectStudyType from "@/components/select-study-type"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import sandbox from "@/public/sandbox-study-type.svg"
import campaign from "@/public/campaign-study-type.svg"
import story from "@/public/story-study-type.svg"

export default function StudyTypePage() {
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
            title="Sandbox"
            description="I have some things in my mind, and I want to start notetaking right away."
            link="/notetaking" />
          <SelectStudyType 
            image={campaign}
            title="Campaign"
            description="I have some resources, but I need help to actually learn them."
            link="#" />
          <SelectStudyType 
            image={story}
            title="Story"
            description="I just want to dump everything I have and have summaries made for me."
            link="/notetaking" />
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