'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';

export default async function FileUploadPage() {
    const router = useRouter();

    const createBlockAndNavigate = () => {
        // Get existing items or initialize empty array
        const existingItems = JSON.parse(localStorage.getItem('rootItems') || '[]');

        // Create new block
        const newBlock = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'File Upload Block',
            type: 'block'
        };

        // Add to existing items
        localStorage.setItem('rootItems', JSON.stringify([...existingItems, newBlock]));

        // Navigate to the new block
        router.push(`/appFinal/dashboard/block/${newBlock.id}`);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">File Upload</h1>
            <div className="space-x-4">
                <button
                    onClick={createBlockAndNavigate}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Easy
                </button>
                <Link href="../mode-specific/fillInTheBlanks">
                    <button className="px-4 py-2 border rounded hover:bg-gray-100">
                        Medium
                    </button>
                </Link>
            </div>
        </div>
    );
}