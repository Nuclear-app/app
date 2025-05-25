import { ChatPerplexity } from "@langchain/community/chat_models/perplexity";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Define the output schema for quizzes
const quizSchema = z.object({
  quizzes: z.array(z.object({
    question: z.string().describe("The quiz question"),
    correctAns: z.string().describe("The correct answer"),
    mistake: z.string().optional().describe("A common mistake or misconception"),
    options: z.array(z.string()).describe("Array of possible answers including the correct one"),
  })).describe("An array of multiple choice quizzes"),
});

// Create the parser
const parser = StructuredOutputParser.fromZodSchema(quizSchema);

// Create the prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert at creating educational multiple choice quizzes.
Given the following text, create 3-5 multiple choice quizzes that test understanding of key concepts.

Text: {text}

{format_instructions}

IMPORTANT RULES:
1. Generate exactly 3-5 multiple choice quizzes
2. For Each Quiz:
   - Each question should have exactly 4 options
   - One option must be the correct answer
   - Other options should be plausible but incorrect
   - Include a common mistake or misconception if relevant
   - Questions should test understanding, not just memorization
3. Question Distribution:
   - Cover different parts of the text
   - Mix factual and conceptual understanding
   - Include questions about key definitions
4. Difficulty Level:
   - Aim for medium difficulty
   - Questions should be challenging but solvable
   - Avoid overly obvious or extremely obscure questions
5. Never hallucinate or make up information not present in the text
`);

export async function generateQuizzes(text: string, blockId: string) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
  }

  const model = new ChatPerplexity({
    apiKey: process.env.PERPLEXITY_API_KEY,
    model: "sonar-medium-online",
  });

  const formatInstructions = parser.getFormatInstructions();
  const prompt = await promptTemplate.format({
    text,
    format_instructions: formatInstructions,
  });

  try {
    const response = await model.invoke(prompt);
    const parsedOutput = await parser.parse(response.content.toString());
    
    // Store quizzes in the database
    const quizPromises = parsedOutput.quizzes.map(quiz => 
      prisma.quiz.create({
        data: {
          question: quiz.question,
          correctAns: quiz.correctAns,
          mistake: quiz.mistake,
          options: quiz.options,
          blockId: blockId,
        },
      })
    );

    await Promise.all(quizPromises);
    return parsedOutput.quizzes;
  } catch (error) {
    console.error("Error generating quizzes:", error);
    throw new Error("Failed to generate quizzes");
  }
}
