"use server"

import { ChatPerplexity } from "@langchain/community/chat_models/perplexity";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { getBlockContext } from "../block";

// Define the lesson plan item schema
const lessonPlanItemSchema = z.object({
  title: z.string().describe("The title of the lesson"),
  description: z.string().describe("A brief one-sentence description of what this lesson covers"),
  order: z.number().describe("The order/step number for this lesson (1, 2, 3, etc.)")
});

// Define the main response schema
const tutorResponseSchema = z.object({
  isValid: z.boolean().describe("Whether the question is related to the provided context"),
  errorMessage: z.string().optional().describe("Error message if the question is not related to the context"),
  answer: z.string().optional().describe("A concise 3-4 sentence answer to the student's question"),
  lessonPlan: z.array(lessonPlanItemSchema).optional().describe("An ordered list of 4-5 prerequisite lessons needed to master the topic"),
});

// Create the parser
const parser = StructuredOutputParser.fromZodSchema(tutorResponseSchema);

// Create the prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert AI tutor who helps students learn complex topics by providing clear answers and structured learning paths.

STUDENT QUESTION: {question}

CONTEXT FROM THEIR STUDY MATERIALS: {context}

Your task is to:

1. **VALIDATE THE QUESTION**: Check if the student's question is related to the provided context. The question should be about concepts, topics, or ideas that are mentioned or implied in the context.

2. **IF QUESTION IS NOT RELATED TO CONTEXT**:
   - Set isValid to false
   - Provide a helpful errorMessage explaining that their question doesn't relate to their current study materials
   - Suggest they ask about topics from their context or provide their question in a different context

3. **IF QUESTION IS RELATED TO CONTEXT**:
   - Set isValid to true
   - Provide a concise answer (3-4 sentences maximum) that directly addresses their question
   - Create a lesson plan with 4-5 prerequisite topics they need to learn to master this concept
   - Each lesson should be a logical step toward understanding their question

IMPORTANT RULES:
- Be a supportive tutor - encourage learning and curiosity
- Keep answers concise but comprehensive
- Lesson plan should be logical progression from basic to advanced
- Maximum 5 lessons in the plan
- Each lesson description should be one clear sentence
- Focus on the most essential prerequisites
- If the question is too basic for the context, still provide a helpful answer
- If the question is too advanced, focus on the foundational lessons needed

{format_instructions}
`);

export async function generateTutorResponse(question: string, blockId: string) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
  }

  try {
    // Fetch the block context
    const context = await getBlockContext(blockId);
    
    if (!context) {
      throw new Error("Block context not found");
    }

    const model = new ChatPerplexity({
      apiKey: process.env.PERPLEXITY_API_KEY,
      model: "sonar", // Using the SONAR model
    });

    const formatInstructions = parser.getFormatInstructions();

    const prompt = await promptTemplate.format({
      question,
      context,
      format_instructions: formatInstructions,
    });

    const response = await model.invoke(prompt);
    const parsedOutput = await parser.parse(response.content.toString());
    
    return parsedOutput;
  } catch (error) {
    console.error("Error generating tutor response:", error);
    throw new Error("Failed to generate tutor response");
  }
}

// Type definitions for TypeScript
export type LessonPlanItem = {
  title: string;
  description: string;
  order: number;
};

export type TutorResponse = {
  isValid: boolean;
  errorMessage?: string;
  answer?: string;
  lessonPlan?: LessonPlanItem[];
};
