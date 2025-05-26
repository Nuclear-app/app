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

    // First, get all topics for this block
    const topics = await prisma.topic.findMany({
      where: { blockId },
      select: { id: true }
    });

    if (!topics.length) {
      throw new Error("No topics found for this block");
    }

    // Get topics that have questions with mistakes
    const topicsWithMistakes = await prisma.quiz.findMany({
      where: {
        topicId: { in: topics.map(t => t.id) },
        mistake: { not: null }
      },
      select: { topicId: true },
      distinct: ['topicId'],
      take: 10 // Limit to prevent memory issues
    });

    // For each topic, get questions
    const quizzesByTopic = await Promise.all(
      topics.map(async (topic) => {
        let retryCount = 0;
        const MAX_RETRIES = 3;
        
        // First, get 2 random unused quizzes
        let quizzes = await prisma.quiz.findMany({
          where: {
            topicId: topic.id,
            used: false
          },
          take: 2,
          orderBy: {
            id: 'asc'
          }
        });

        // If this topic has mistakes, get 1 more question
        if (topicsWithMistakes.some(t => t.topicId === topic.id)) {
          const extraQuizzes = await prisma.quiz.findMany({
            where: {
              topicId: topic.id,
              used: false
            },
            take: 1,
            orderBy: {
              id: 'asc'
            }
          });
          quizzes = [...quizzes, ...extraQuizzes];
        }

        // If we don't have enough questions, generate new ones
        while (quizzes.length < 2 && retryCount < MAX_RETRIES) {
          const block = await prisma.block.findUnique({
            where: { id: blockId },
            select: { context: true }
          });

          if (block?.context) {
            await generateQuizzes(block.context, blockId);
            
            const newQuizzes = await prisma.quiz.findMany({
              where: {
                topicId: topic.id,
                used: false
              },
              take: 2,
              orderBy: {
                id: 'asc'
              }
            });
            quizzes = [...quizzes, ...newQuizzes];
          }
          retryCount++;
        }

        // Mark these quizzes as used using a transaction
        if (quizzes.length > 0) {
          await prisma.$transaction(async (tx) => {
            await tx.quiz.updateMany({
              where: {
                id: {
                  in: quizzes.map(q => q.id)
                }
              },
              data: {
                used: true
              }
            });
          });
        }

        return quizzes;
      })
    );

    // Flatten the array of quizzes and shuffle them
    let allQuizzes = quizzesByTopic.flat();
    
    // Limit to 10 questions
    if (allQuizzes.length > 10) {
      allQuizzes = allQuizzes.slice(0, 10);
    }
    
    const shuffledQuizzes = allQuizzes.sort(() => Math.random() - 0.5);

    return shuffledQuizzes;
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