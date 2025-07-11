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
    options: z.array(z.string()).describe("Array of possible answers including the correct one"),
  })).describe("An array of multiple choice quizzes"),
});

// Create the parser
const parser = StructuredOutputParser.fromZodSchema(quizSchema);

// Create the prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert at creating educational multiple choice quizzes.
Given the following text and topic, create 5-6 multiple choice quizzes that test understanding of this specific topic.

Text: {text}
Topic: {topic}
Topic Examples: {examples}

{format_instructions}

IMPORTANT RULES:
1. Generate exactly 5-6 multiple choice quizzes for this specific topic
2. For Each Quiz:
   - Each question should have exactly 4 options
   - One option must be the correct answer
   - Other options should be plausible but incorrect
   - Questions should test understanding, not just memorization
   - Make questions clear and unambiguous
   - Avoid using "all of the above" or "none of the above" as options
   - Keep questions concise and to the point
   - Use consistent language and terminology throughout
3. Question Distribution:
   - Cover different aspects of the topic
   - Mix factual and conceptual understanding
   - Include questions about key definitions
   - Vary question types:
     * Direct knowledge questions
     * Application questions
     * Analysis questions
     * Comparison questions
4. Difficulty Level:
   - Aim for medium difficulty
   - Questions should be challenging but solvable
   - Avoid overly obvious or extremely obscure questions
   - Ensure options are of similar length and complexity
   - Make sure the correct answer isn't always the longest or shortest option
5. Content Guidelines:
   - Never hallucinate or make up information not present in the text
   - Use precise and accurate language
   - Avoid ambiguous or vague wording
   - Ensure questions are relevant to the specific topic
   - Make sure each question has only one correct answer
6. Option Guidelines:
   - All options should be grammatically consistent
   - Options should be mutually exclusive
   - Avoid overlapping or redundant options
   - Make sure incorrect options are plausible but clearly wrong
   - Keep options concise and clear
`);

export async function generateQuizzes(text: string, blockId: string) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
  }

  // Get all topics for this block
  const topics = await prisma.topic.findMany({
    where: { blockId },
  });

  if (!topics.length) {
    throw new Error("No topics found for this block");
  }

  const model = new ChatPerplexity({
    apiKey: process.env.PERPLEXITY_API_KEY,
    model: "sonar",
  });

  const formatInstructions = parser.getFormatInstructions();

  // Generate quizzes for each topic
  for (const topic of topics) {
    const prompt = await promptTemplate.format({
      text,
      topic: topic.name,
      examples: topic.examples.join(", "),
      format_instructions: formatInstructions,
    });

    try {
      const response = await model.invoke(prompt);
      const parsedOutput = await parser.parse(response.content.toString());
      
      // Create the quizzes for this topic
      const quizPromises = parsedOutput.quizzes.map(quiz => 
        prisma.quiz.create({
          data: {
            question: quiz.question,
            correctAns: quiz.correctAns,
            options: quiz.options,
            blockId: blockId,
            topicId: topic.id,
          },
        })
      );

      await Promise.all(quizPromises);
    } catch (error) {
      console.error(`Error generating quizzes for topic ${topic.name}:`, error);
      throw new Error(`Failed to generate quizzes for topic ${topic.name}`);
    }
  }

  // Return all quizzes for all topics
  return await prisma.quiz.findMany({
    where: { blockId },
    include: { topic: true },
  });
}



// Remove the unused text variable - it's not being used anywhere
// const text = `Pollution is the introduction...` - removing this entire block

// generateQuizzes(text, "d0220f26-c780-41e7-af30-85e0eaf89bb7");