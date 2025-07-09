'use client'

import SelectStudyType from "@/components/select-study-type"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import sandbox from "@/public/sandbox-study-type.svg"
import campaign from "@/public/campaign-study-type.svg"
import story from "@/public/story-study-type.svg"
import { createInitialBlock } from "@/app/actions/create-initial-block"
import { useState, Suspense } from "react"
import { toast } from "sonner"
// Again I don't think Mode is actually being used.
import { Block, Mode } from "@/lib/generated/prisma";

function StudyTypeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState<Mode | null>(null);

    const blockId = searchParams.get('blockId');
    const newBlock = !blockId;

    const handleModeSelect = async (mode: Mode, path: string) => {
        try {
            setIsLoading(mode);

            // Store mode in localStorage for campaign and story modes
            if (mode !== Mode.HARD) {
                try {
                    localStorage.setItem('selectedMode', mode);
                } catch (e) {
                    console.warn('Failed to store mode in localStorage:', e);
                }
            }

            // Handle existing blocks
            if (!newBlock) {
                if (!blockId) {
                    throw new Error('Block ID is required for existing blocks');
                }
                router.push(`${path}/${encodeURIComponent(blockId)}`);
                return;
            }

            // Create new block for new users
            const result = await createInitialBlock(mode);
            
            if (!result?.success || !result?.data?.id) {
                throw new Error(result?.error || 'Failed to create initial block');
            }

            // Navigate to the appropriate path based on mode
            if (mode === Mode.HARD) {
                // Deathmarch mode - go directly to block editor
                router.push(`/dashboard/block/${encodeURIComponent(result.data.id)}`);
            } else {
                // Story & Sword and Just the Story modes - go to file input
                router.push(`/modeSpecific/fileInput?blockId=${encodeURIComponent(result.data.id)}`);
            }
        } catch (error) {
            console.error('Error in handleModeSelect:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to process your request');
        } finally {
            setIsLoading(null);
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
                        onClick={() => handleModeSelect(Mode.HARD, '/dashboard/block')}
                        disabled={isLoading !== null}
                        loading={isLoading === Mode.HARD} />
                    <SelectStudyType 
                        image={campaign}
                        title="Story & Sword"
                        description="I have some resources, but I need help to actually learn them."
                        onClick={() => handleModeSelect(Mode.MEDIUM, '/modeSpecific/fileInput')}
                        disabled={isLoading !== null}
                        loading={isLoading === Mode.MEDIUM} />
                    <SelectStudyType 
                        image={story}
                        title="Just the Story"
                        description="I just want to dump everything I have and have summaries made for me."
                        onClick={() => handleModeSelect(Mode.EASY, '/modeSpecific/fileInput')}
                        disabled={isLoading !== null}
                        loading={isLoading === Mode.EASY} />
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

export default function StudyType() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StudyTypeContent />
        </Suspense>
    );
} 