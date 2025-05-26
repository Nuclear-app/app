"use server"

import prisma from "@/lib/prisma";

export const fetchQuiz = async (blockId: string) => {
  // First, get all topics for this block
  const topics = await prisma.topic.findMany({
    where: { blockId },
    select: { id: true }
  });

  // For each topic, get 2 random unused quizzes
  const quizzesByTopic = await Promise.all(
    topics.map(async (topic) => {
      const quizzes = await prisma.quiz.findMany({
        where: {
          topicId: topic.id,
          used: false
        },
        take: 2,
        orderBy: {
          // This creates a random order
          id: 'asc'
        }
      });

      // Mark these quizzes as used
      if (quizzes.length > 0) {
        await prisma.quiz.updateMany({
          where: {
            id: {
              in: quizzes.map(q => q.id)
            }
          },
          data: {
            used: true
          }
        });
      }

      return quizzes;
    })
  );

  // Flatten the array of quizzes and shuffle them
  const allQuizzes = quizzesByTopic.flat();
  const shuffledQuizzes = allQuizzes.sort(() => Math.random() - 0.5);

  return shuffledQuizzes;
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