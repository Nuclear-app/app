'use server';

import { ChatPerplexity } from "@langchain/community/chat_models/perplexity";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Define the output schema for FAQ answers
const faqSchema = z.object({
  answer: z.string().describe("A detailed answer to the question, approximately 200 words"),
});

// Create the parser
const parser = StructuredOutputParser.fromZodSchema(faqSchema);

// Create the prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert at providing detailed, educational answers to questions.
Given the following text and question, provide a comprehensive answer that demonstrates deep understanding of the topic.

Text: {text}
Question: {question}

{format_instructions}

IMPORTANT RULES:
1. Answer Structure:
   - Start with a clear, direct answer to the question
   - Provide detailed explanations and context
   - Include relevant examples or analogies
   - Use clear, academic language
   - Maintain a logical flow of ideas

2. Content Guidelines:
   - Answer should be approximately 200 words
   - Stay focused on the specific question
   - Use information only from the provided text
   - Never hallucinate or make up information
   - Include key terms and concepts from the text

3. Quality Requirements:
   - Be comprehensive but concise
   - Use precise and accurate language
   - Avoid unnecessary jargon
   - Make complex ideas accessible
   - Support claims with evidence from the text

4. Formatting:
   - Use paragraphs for better readability
   - Include transition phrases between ideas
   - Maintain a professional tone
   - Be objective and factual
   - Avoid personal opinions or speculation

5. Answer Depth:
   - Explain the "why" behind concepts
   - Connect ideas to broader context
   - Highlight important relationships
   - Address potential misconceptions
   - Provide clear definitions of key terms
`);

export async function generateFAQAnswer(text: string, question: string, blockId: string) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
  }

  const model = new ChatPerplexity({
    apiKey: process.env.PERPLEXITY_API_KEY,
    model: "sonar",
  });

  const formatInstructions = parser.getFormatInstructions();

  const prompt = await promptTemplate.format({
    text,
    question,
    format_instructions: formatInstructions,
  });

  try {
    const response = await model.invoke(prompt);
    const parsedOutput = await parser.parse(response.content.toString());
    
    // Store the question and answer in the database
    const storedQuestion = await prisma.question.create({
      data: {
        question: question,
        answer: parsedOutput.answer,
        blockId: blockId,
      },
    });

    return storedQuestion;
  } catch (error) {
    console.error("Error generating FAQ answer:", error);
    throw new Error("Failed to generate FAQ answer");
  }
}
