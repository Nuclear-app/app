'use client';

import Link from 'next/link';

type Params = Promise<{ slug: string[] }>

export default async function BlockPage({ params }: { params: Params }) {
    const { slug } = await params
    const id = slug[0]
    return (
        <div className="p-6">
            <div className="flex gap-4 mb-4">
                <Link href="../root">
                    Back to Root
                </Link>
                <Link href="../../mode-specific/fileUpload">
                    Upload File
                </Link>
                <Link href="./examples">
                    Examples
                </Link>
                <Link href="./faq">
                    FAQ
                </Link>
                <Link href="./flashcards">
                    Flashcards
                </Link>
                <Link href="./note">
                    Note
                </Link>
                <Link href="./quizzes">
                    Quizzes
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-6">Block: {id}</h1>
        </div>
    );
} 