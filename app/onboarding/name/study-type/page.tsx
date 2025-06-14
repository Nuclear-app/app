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

type StudyMode = 'sandbox' | 'campaign' | 'story';

function StudyTypeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState<StudyMode | null>(null);

    const newBlock = searchParams.get('newBlock') === 'true';
    const blockId = searchParams.get('blockId');

    const handleModeSelect = async (mode: StudyMode, path: string) => {
        try {
            setIsLoading(mode);

            // Store mode in localStorage for campaign and story modes
            if (mode !== 'sandbox') {
                try {
                    localStorage.setItem('selectedMode', mode);
                } catch (e) {
                    console.warn('Failed to store mode in localStorage:', e);
                }
            }

            // Create initial block if needed
            if (!newBlock) {
                if (!blockId) {
                    throw new Error('Block ID is required for existing blocks');
                }
                router.push(`${path}/${encodeURIComponent(blockId)}`);
                return;
            }

            const result = await createInitialBlock(mode);
            
            if (!result?.success || !result?.data?.id) {
                throw new Error(result?.error || 'Failed to create initial block');
            }

            // Navigate to the appropriate path with the block ID
            router.push(`${path}?blockId=${encodeURIComponent(result.data.id)}`);
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
                        onClick={() => handleModeSelect('sandbox', '/dashboard/block')}
                        disabled={isLoading !== null}
                        loading={isLoading === 'sandbox'} />
                    <SelectStudyType 
                        image={campaign}
                        title="Story & Sword"
                        description="I have some resources, but I need help to actually learn them."
                        onClick={() => handleModeSelect('campaign', '/modeSpecific/fileInput')}
                        disabled={isLoading !== null}
                        loading={isLoading === 'campaign'} />
                    <SelectStudyType 
                        image={story}
                        title="Just the Story"
                        description="I just want to dump everything I have and have summaries made for me."
                        onClick={() => handleModeSelect('story', '/modeSpecific/fileInput')}
                        disabled={isLoading !== null}
                        loading={isLoading === 'story'} />
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

export default function StudyTypePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StudyTypeContent />
        </Suspense>
    );
} 