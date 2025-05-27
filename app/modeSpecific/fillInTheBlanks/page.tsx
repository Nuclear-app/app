'use client'

import { FillInBlank } from "@/components/fill-in-blank";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';

export default function FillInTheBlanksPage() {
    const searchParams = useSearchParams();
    const blockId = searchParams.get('blockId');

    return (
        <div>
            <div>
                <FillInBlank sentence="The quick brown fox jumps over the lazy dog" answer="fox" />
            </div>
            <div>
                <Link href={blockId ? `/dashboard/block/${blockId}` : "/dashboard"}>
                    <Button>Back to Block</Button>
                </Link>
            </div>
        </div>
    );
}