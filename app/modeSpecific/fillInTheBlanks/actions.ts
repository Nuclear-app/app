'use server'

import prisma from "@/lib/prisma";
import { generateFillInTheBlank } from "@/lib/perplexity";

export async function getBlockContext(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: {
      context: true,
    },
  });

  if (!block || !block.context) {
    throw new Error("Block or context not found");
  }

  return block.context;
}

export async function createFillInTheBlanks(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  // Get the block context
  const context = await getBlockContext(blockId);

  // Generate questions using Perplexity
  const questions = await generateFillInTheBlank(context);

  // Store questions in the database
  const createdQuestions = await prisma.$transaction(
    questions.map((question) =>
      prisma.fillInTheBlank.create({
        data: {
          sentence: question.sentence,
          answer: question.answer,
          hint: question.hint || null,
          blockId: blockId,
        },
      })
    )
  );

  return createdQuestions;
}

export async function getFillInTheBlanks(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  return await prisma.fillInTheBlank.findMany({
    where: {
      blockId: blockId,
    },
    orderBy: {
      id: 'asc',
    },
  });
}

export async function deleteFillInTheBlanks(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  await prisma.fillInTheBlank.deleteMany({
    where: {
      blockId: blockId,
    },
  });
} 