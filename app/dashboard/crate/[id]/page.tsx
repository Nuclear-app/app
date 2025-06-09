'use client';

import { useParams } from 'next/navigation';
import CrateComponent from '@/components/crateComponent/crate';

export default function CratePage() {
    const params = useParams();
    const crateId = params.id as string;
    
    return <CrateComponent crateId={crateId} />;
} 