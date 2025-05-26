"use server"

import prisma from "@/lib/prisma";
import { generateQuizzes } from "@/lib/quizGen";

interface Quiz {
  id: string;
  topicId: string;
  used: boolean;
  mistake: string | null;
  question: string;
  correctAns: string;
  options: string[];
}

export const fetchQuiz = async (blockId: string): Promise<Quiz[]> => {
  try {
    if (!blockId) {
      throw new Error("Block ID is required");
    }

    // Get all topics and quizzes in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get topics
      const topics = await tx.topic.findMany({
        where: { blockId },
        select: { id: true }
      });

      if (!topics.length) {
        throw new Error("No topics found for this block");
      }

      // Get topics with mistakes
      const topicsWithMistakes = await tx.quiz.findMany({
        where: {
          topicId: { in: topics.map(t => t.id) },
          mistake: { not: null }
        },
        select: { topicId: true },
        distinct: ['topicId'],
        take: 10
      });

      // Get all needed quizzes in one query
      const quizzes = await tx.quiz.findMany({
        where: {
          topicId: { in: topics.map(t => t.id) },
          used: false
        },
        take: 10
      });

      // Mark quizzes as used
      if (quizzes.length > 0) {
        await tx.quiz.updateMany({
          where: {
            id: { in: quizzes.map(q => q.id) }
          },
          data: { used: true }
        });
      }

      return quizzes;
    });

    // Shuffle and return
    return result.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw new Error("Failed to fetch quizzes");
  }
};

export const updateMistake = async (quizId: string, mistake: string) => {
  try {
    await prisma.quiz.update({
      where: { id: quizId },
      data: { mistake }
    });
  } catch (error) {
    console.error("Failed to update mistake:", error);
    throw new Error("Failed to update mistake in database");
  }
};
    
export const updatePoints = async (blockID: string, points: number) => {
  try {
    await prisma.block.update({
      where: { id: blockID },
      data: { points: { increment: points } }
    });
  } catch (error) {
    console.error("Failed to update points:", error);
    throw new Error("Failed to update points in database");
  }
};