"use server";

import { ChatPerplexity } from "@langchain/community/chat_models/perplexity";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Define the output schema for flashcards
const flashcardSchema = z.object({
  flashcards: z.array(z.object({
    front: z.string().describe("The question or concept prompt for the flashcard"),
    back: z.string().describe("The answer or explanation for the flashcard"),
  })),
});

// Create the parser
const parser = StructuredOutputParser.fromZodSchema(flashcardSchema);

// Create the prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert at creating educational flashcards from academic content. Your task is to generate high-quality study flashcards that help students learn and retain important information.

Given the following educational text, create flashcards that cover the key concepts, facts, definitions, and important details.

Text: {text}

{format_instructions}

IMPORTANT RULES:

1. Generate 10 flashcards that cover the most important content from the text.

2. Each flashcard should have:
   - FRONT: A clear question, concept, or prompt that tests understanding
   - BACK: A comprehensive answer or explanation that provides the correct information

3. Front side guidelines:
   - Ask specific questions about key concepts, definitions, or facts
   - Use "What is...", "Define...", "Explain...", "How does...", "Why is..." formats
   - Be clear and unambiguous
   - Focus on important, testable content
   - Avoid overly complex or vague questions

4. Back side guidelines:
   - Provide complete, accurate answers
   - Include relevant context and explanations
   - Be concise but comprehensive
   - Use clear, educational language
   - Ensure the answer directly addresses the front question

5. Content focus:
   - Prioritize factual information, definitions, and key concepts
   - Include important dates, names, processes, or relationships
   - Cover both basic facts and deeper understanding
   - Ensure variety in question types and difficulty levels

6. Quality standards:
   - Each flashcard should be self-contained and clear
   - Avoid ambiguous or overly subjective content
   - Ensure accuracy and relevance to the source text
   - Make flashcards suitable for active recall practice

7. Do not:
   - Generate flashcards for content not present in the text
   - Create overly simple or obvious flashcards
   - Include personal opinions or interpretations
   - Make flashcards that are too similar to each other
`);

export async function generateFlashcards(text: string, blockId: string) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
  }

  const model = new ChatPerplexity({
    apiKey: process.env.PERPLEXITY_API_KEY,
    model: "sonar", // Using the SONAR model
  });

  const formatInstructions = parser.getFormatInstructions();

  const prompt = await promptTemplate.format({
    text,
    format_instructions: formatInstructions,
  });

  try {
    const response = await model.invoke(prompt);
    const parsedOutput = await parser.parse(response.content.toString());

    // Use Promise.all to wait for all flashcards to be created
    const storedFlashcards = await Promise.all(
      parsedOutput.flashcards.map((flashcard) =>
        prisma.flashcard.create({
          data: {
            front: flashcard.front,
            back: flashcard.back,
            blockId: blockId,
          },
        })
      )
    );

    return storedFlashcards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
}

export async function getFlashcards(blockId: string) {
  try {
    const flashcards = await prisma.flashcard.findMany({
      where: {
        blockId: blockId,
      },
      orderBy: {
        id: 'asc',
      },
    });
    return flashcards;
  } catch (error) {
    console.error("Error getting flashcards:", error);
    throw new Error("Failed to get flashcards");
  }
}