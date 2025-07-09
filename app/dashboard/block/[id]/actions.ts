

import { fetchContext } from "@/app/modeSpecific/fileInput/actions";
import { generateExamples } from "@/lib/examplesPerplexity";
import { generateQuizzes } from "@/lib/quizGen";
import { JSONContent } from "novel";
import { getFullContext } from "../actions";

export async function getNoteContent(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required " + blockId);
  }

  const block = await getBlockNote(blockId)

  if (!block) {
    throw new Error("Block not found");
  }

  // Return empty editor state if no note exists
  if (!block.note) {
    const emptyContent: JSONContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    };
    return JSON.stringify(emptyContent);
  }

  // Ensure the note is properly formatted as JSONContent
  try {
    // If note is already a string, parse it to ensure it's valid JSON
    const noteContent = typeof block.note === 'string' 
      ? JSON.parse(block.note) 
      : block.note;

    // Validate the structure
    if (!noteContent || typeof noteContent !== 'object' || !noteContent.type || !noteContent.content) {
      throw new Error("Invalid note format");
    }

    return JSON.stringify(noteContent);
  } catch (error) {
    console.error("Error parsing note content:", error);
    // Return empty editor state if parsing fails
    const emptyContent: JSONContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    };
    return JSON.stringify(emptyContent);
  }
}

export async function generateExamplesIfNeeded(blockId: string) {
  const content = await getFullContext(blockId);
  console.log("Checking for existing examples...");
  
  // Check if examples (topics) already exist
  const existingTopics = await prisma.topic.findMany({
    where: { blockId },
    select: { id: true }
  });
  
  // Only generate examples if none exist
  if (existingTopics.length === 0) {
    console.log("No topics found, generating examples...");
    await generateExamples(content, blockId);
  } else {
    console.log(`Found ${existingTopics.length} existing topics, skipping example generation`);
  }
}

export async function generateQuizzesIfNeeded(blockId: string) {
  const content = await getFullContext(blockId);
  console.log("Checking for existing quizzes...");
  
  // Check if quizzes already exist
  const existingQuizzes = await prisma.quiz.findMany({
    where: { blockId },
    select: { id: true }
  });
  
  // Only generate quizzes if none exist
  if (existingQuizzes.length === 0) {
    console.log("No quizzes found, generating quizzes...");
    await generateQuizzes(content, blockId);
  } else {
    console.log(`Found ${existingQuizzes.length} existing quizzes, skipping quiz generation`);
  }
}

export async function bgFunction(blockId: string) {
  const content = await getFullContext(blockId);
  console.log(content);
  
  // Check if examples (topics) already exist
  const existingTopics = await prisma.topic.findMany({
    where: { blockId },
    select: { id: true }
  });
  
  // Check if quizzes already exist
  const existingQuizzes = await prisma.quiz.findMany({
    where: { blockId },
    select: { id: true }
  });
  
  // Only generate examples if none exist
  if (existingTopics.length === 0) {
    console.log("No topics found, generating examples...");
    await generateExamples(content, blockId);
  } else {
    console.log(`Found ${existingTopics.length} existing topics, skipping example generation`);
  }
  
  // Only generate quizzes if none exist
  if (existingQuizzes.length === 0) {
    console.log("No quizzes found, generating quizzes...");
    await generateQuizzes(content, blockId);
  } else {
    console.log(`Found ${existingQuizzes.length} existing quizzes, skipping quiz generation`);
  }
}