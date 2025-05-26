"use server"

import prisma from "@/lib/prisma";

// Fetch all quizzes for a block
export const fetchQuizzes = async (blockId: string) => {
  const quizzes = await prisma.quiz.findMany({
    where: { 
      blockId: blockId 
    },
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  });
  return quizzes;
};

// Fetch a single quiz by ID
export const fetchQuizById = async (quizId: string) => {
  const quiz = await prisma.quiz.findUnique({
    where: { 
      id: quizId 
    },
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  });
  return quiz;
};

// Fetch questions for a specific quiz
export const fetchQuizQuestions = async (quizId: string) => {
  const questions = await prisma.question.findMany({
    where: { 
      quizId: quizId 
    },
    include: {
      options: true
    }
  });
  return questions;
};

// Fetch a single question with its options
export const fetchQuestion = async (questionId: string) => {
  const question = await prisma.question.findUnique({
    where: { 
      id: questionId 
    },
    include: {
      options: true
    }
  });
  return question;
};
