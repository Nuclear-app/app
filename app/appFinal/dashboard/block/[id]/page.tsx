'use client';

import Link from 'next/link';

export default function BlockPage({ params }: { params: { id: string } }) {
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
            <h1 className="text-2xl font-bold mb-6">Block: {params.id}</h1>
        </div>
    );
} 