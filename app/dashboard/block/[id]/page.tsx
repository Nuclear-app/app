'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function BlockPage() {
    const params = useParams();
    const blockId = params.id as string;

    return (
        <div className="container h-5/6 grid grid-rows-8 grid-cols-3 gap-4">
            <div className="col-span-2 row-span-1 rounded-xl bg-[#161616] border-2 border-nuclear p-4 font-black text-3xl flex items-center">
                <Link href="/dashboard" className="hover:opacity-80">← Back to Dashboard</Link>
            </div>
            <div className="col-span-2 row-span-7 bg-[#161616] rounded-xl border-2 p-4">
                <h1 className="text-2xl font-black mb-6">Block View</h1>
                <div className="grid grid-cols-2 gap-4">
                    <Link 
                        href={`/dashboard/block/${blockId}/note`}
                        className="bg-[#292929] rounded-xl border-2 p-4 hover:bg-[#333333] flex items-center justify-center"
                    >
                        Notes
                    </Link>
                    <Link 
                        href={`/dashboard/block/${blockId}/flashcards`}
                        className="bg-[#292929] rounded-xl border-2 p-4 hover:bg-[#333333] flex items-center justify-center"
                    >
                        Flashcards
                    </Link>
                    <Link 
                        href={`/dashboard/block/${blockId}/quizzes`}
                        className="bg-[#292929] rounded-xl border-2 p-4 hover:bg-[#333333] flex items-center justify-center"
                    >
                        Quizzes
                    </Link>
                    <Link 
                        href={`/dashboard/block/${blockId}/examples`}
                        className="bg-[#292929] rounded-xl border-2 p-4 hover:bg-[#333333] flex items-center justify-center"
                    >
                        Examples
                    </Link>
                    <Link 
                        href={`/dashboard/block/${blockId}/faq`}
                        className="bg-[#292929] rounded-xl border-2 p-4 hover:bg-[#333333] flex items-center justify-center"
                    >
                        FAQ
                    </Link>
                </div>
            </div>
        </div>
    );
} 