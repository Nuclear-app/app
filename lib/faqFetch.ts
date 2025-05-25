"use server";

import prisma from "@/lib/prisma";

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    blockId: string;
}

export async function fetchAllFAQs(blockId: string): Promise<FAQItem[]> {
    try {
        const faqs = await prisma.question.findMany({
            where: {
                blockId: blockId
            },
            orderBy: {
                id: 'desc'
            }
        });

        return faqs;
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        throw new Error("Failed to fetch FAQs");
    }
}
