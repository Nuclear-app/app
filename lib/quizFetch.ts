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
    let { unusedQuizzes, mistakeQuizzes } = await prisma.$transaction(async (tx) => {
      // Get topics
      const topics = await tx.topic.findMany({
        where: { blockId },
        select: { id: true }
      });

      if (!topics.length) {
        throw new Error("No topics found for this block");
      }

      const topicIds = topics.map(t => t.id);

      // Get all quizzes with mistakes (even if used)
      const mistakeQuizzes = await tx.quiz.findMany({
        where: {
          topicId: { in: topicIds },
          mistake: { not: null }
        }
      });

      // Get up to 10 unused quizzes
      const unusedQuizzes = await tx.quiz.findMany({
        where: {
          topicId: { in: topicIds },
          used: false
        },
        take: 10
      });

      // Mark unused quizzes as used
      if (unusedQuizzes.length > 0) {
        await tx.quiz.updateMany({
          where: {
            id: { in: unusedQuizzes.map(q => q.id) }
          },
          data: { used: true }
        });
      }

      return { unusedQuizzes, mistakeQuizzes };
    });

    // If no quizzes, generate more
    if (unusedQuizzes.length === 0 && mistakeQuizzes.length === 0) {
      // Get block context
      const block = await prisma.block.findUnique({
        where: { id: blockId },
        select: { context: true }
      });
      if (!block || !block.context) {
        throw new Error("Block context not found for quiz generation");
      }
      await generateQuizzes(block.context, blockId);
      // Fetch quizzes again
      const topics = await prisma.topic.findMany({
        where: { blockId },
        select: { id: true }
      });
      const topicIds = topics.map(t => t.id);
      mistakeQuizzes = await prisma.quiz.findMany({
        where: {
          topicId: { in: topicIds },
          mistake: { not: null }
        }
      });
      unusedQuizzes = await prisma.quiz.findMany({
        where: {
          topicId: { in: topicIds },
          used: false
        },
        take: 10
      });
      if (unusedQuizzes.length > 0) {
        await prisma.quiz.updateMany({
          where: {
            id: { in: unusedQuizzes.map(q => q.id) }
          },
          data: { used: true }
        });
      }
    }

    // Combine and shuffle
    const combined = [...mistakeQuizzes, ...unusedQuizzes];
    return combined.sort(() => Math.random() - 0.5);
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