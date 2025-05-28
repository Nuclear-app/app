'use client'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card"
import Image from "next/image"

interface SelectStudyTypeProps {
    image: any;
    title: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
}

export default function SelectStudyType({ image, title, description, onClick, disabled, loading }: SelectStudyTypeProps) {
    return (
        <div 
            onClick={disabled ? undefined : onClick}
            className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-nuclear hover:scale-105'}`}
        >
            {loading && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            )}
            <Image src={image} alt={title} className="w-32 h-32 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-center text-gray-400">{description}</p>
        </div>
    );
} 