'use server'

import { generateFillInTheBlank } from "@/lib/perplexity";
import { getBlockContext } from "@/lib/block";
import { deleteFillInTheBlanksByBlock, getFillInTheBlanksByBlock, createFillInTheBlank } from "@/lib/fillInTheBlank";

export async function createFillInTheBlanks(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  // Get the block context
  const context = await getBlockContext(blockId);
  if (!context) {
    throw new Error("Block context not found");
  }

  // Generate questions using Perplexity
  const questions = await generateFillInTheBlank(context);

  // Store questions in the database using the library function
  const createdQuestions = await Promise.all(
    questions.map((question) =>
      createFillInTheBlank({
        sentence: question.sentence,
        answer: question.answer,
        hint: question.hint || undefined,
        blockId: blockId,
      })
    )
  );

  return createdQuestions;
}

export async function getFillInTheBlanks(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  return getFillInTheBlanksByBlock(blockId);
}

export async function deleteFillInTheBlanks(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  return deleteFillInTheBlanksByBlock(blockId);
} 