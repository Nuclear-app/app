'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Block } from '@/components/block';

export default function BlockPage() {
    const params = useParams();
    const blockId = params.id as string;

    return (
        <div>
            <Block blockId={blockId} />
        </div>
    );
}