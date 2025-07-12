"use server"

import prisma from "@/lib/prisma";
import { Quiz } from "@prisma/client";
import { getQuizWithTopicsCache, invalidateQuizzesCache } from "@/lib/redis";
import { generateQuizzes } from "./quizGen";

export const removeMistake = async (quizId: string) => {
  await prisma.quiz.update({
    where: { id: quizId },
    data: { mistake: null }
  });
};

export const fetchQuiz = async (blockId: string): Promise<Quiz[]> => {
  try {
    if (!blockId) {
      throw new Error("Block ID is required");
    }

    // Get all topics and quizzes using cached function
    let { unusedQuizzes, mistakeQuizzes } = await getQuizWithTopicsCache(blockId);

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
      
      // Fetch quizzes again using cache
      const result = await getQuizWithTopicsCache(blockId);
      unusedQuizzes = result.unusedQuizzes;
      mistakeQuizzes = result.mistakeQuizzes;
    }

    // Mark unused quizzes as used if any were found
    if (unusedQuizzes.length > 0) {
      await prisma.quiz.updateMany({
        where: {
          id: { in: unusedQuizzes.map(q => q.id) }
        },
        data: { used: true }
      });
      
      // Invalidate cache after marking as used
      await invalidateQuizzesCache(blockId);
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