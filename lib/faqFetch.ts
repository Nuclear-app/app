"use server";

import { Question } from "@prisma/client";
import { getQuestionsByBlockWithCache } from "@/lib/redis";

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    blockId: string;
}

export async function fetchAllFAQs(blockId: string): Promise<FAQItem[]> {
    try {
        const faqs = await getQuestionsByBlockWithCache(blockId);
        return faqs;
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        throw new Error("Failed to fetch FAQs");
    }
}
