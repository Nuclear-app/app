'use server'

import { fetchContext } from "@/app/modeSpecific/fileInput/actions";
import { generateExamples } from "@/lib/examplesPerplexity";
import { generateQuizzes } from "@/lib/quizGen";
import { JSONContent } from "novel";
import { getFullContext } from "@/lib/context";
import { getBlockNoteWithCache } from "@/lib/redis";
import { getBreadcrumbWithCache, getExamplesWithCache } from "@/lib/redis";
import prisma from "@/lib/prisma";

export async function getNoteContent(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required " + blockId);
  }

  console.log("getNoteContent: Fetching block for ID:", blockId);
  const block = await getBlockNoteWithCache(blockId)

  if (!block) {
    console.log("getNoteContent: Block not found for ID:", blockId);
    throw new Error("Block not found");
  }

  console.log("getNoteContent: Block found, note type:", typeof block.note, "note value:", block.note);

  // Return empty editor state if no note exists
  if (!block.note) {
    console.log("getNoteContent: No note content, returning empty editor state");
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

    console.log("getNoteContent: Parsed note content:", noteContent);

    // Validate the structure
    if (!noteContent || typeof noteContent !== 'object' || !noteContent.type || !noteContent.content) {
      console.log("getNoteContent: Invalid note format, returning empty state");
      throw new Error("Invalid note format");
    }

    console.log("getNoteContent: Returning valid note content");
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

export async function getBreadcrumbData(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  console.log("getBreadcrumbData: Fetching breadcrumb for block ID:", blockId);
  
  try {
    const breadcrumb = await getBreadcrumbWithCache(blockId);
    return breadcrumb;
  } catch (error) {
    console.error("Error fetching breadcrumb:", error);
    throw new Error("Failed to fetch breadcrumb data");
  }
}

export async function getExamplesData(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  console.log("getExamplesData: Fetching examples for block ID:", blockId);
  
  try {
    const examples = await getExamplesWithCache(blockId);
    return examples;
  } catch (error) {
    console.error("Error fetching examples:", error);
    throw new Error("Failed to fetch examples data");
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

export async function deleteExamples(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  console.log("Deleting examples for block:", blockId);
  
  try {
    // Delete all topics (examples) associated with this block
    const deletedTopics = await prisma.topic.deleteMany({
      where: {
        blockId: blockId,
      },
    });

    console.log(`Deleted ${deletedTopics.count} topics for block ${blockId}`);
    return { success: true, deletedCount: deletedTopics.count };
  } catch (error) {
    console.error("Error deleting examples:", error);
    throw new Error("Failed to delete examples");
  }
}

export async function regenerateExamples(blockId: string, context: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  console.log("Regenerating examples for block:", blockId);
  
  try {
    // First delete existing examples
    await deleteExamples(blockId);
    
    // Then generate new examples
    const newTopics = await generateExamples(context, blockId);
    
    console.log(`Generated ${newTopics.length} new topics for block ${blockId}`);
    return { success: true, topics: newTopics };
  } catch (error) {
    console.error("Error regenerating examples:", error);
    throw new Error("Failed to regenerate examples");
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

