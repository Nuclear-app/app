'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function BlockPage() {
    const params = useParams();
    const blockId = params.id as string;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Block View</h1>
            <div className="grid grid-cols-2 gap-4">
                <Link 
                    href={`/dashApp/block/${blockId}/note`}
                    className="p-4 border rounded hover:bg-gray-50"
                >
                    Notes
                </Link>
                <Link 
                    href={`/dashApp/block/${blockId}/flashcards`}
                    className="p-4 border rounded hover:bg-gray-50"
                >
                    Flashcards
                </Link>
                <Link 
                    href={`/dashApp/block/${blockId}/quizzes`}
                    className="p-4 border rounded hover:bg-gray-50"
                >
                    Quizzes
                </Link>
                <Link 
                    href={`/dashApp/block/${blockId}/examples`}
                    className="p-4 border rounded hover:bg-gray-50"
                >
                    Examples
                </Link>
                <Link 
                    href={`/dashApp/block/${blockId}/faq`}
                    className="p-4 border rounded hover:bg-gray-50"
                >
                    FAQ
                </Link>
            </div>
        </div>
    );
} 