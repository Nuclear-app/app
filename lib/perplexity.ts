import { ChatPerplexity } from "@langchain/community/chat_models/perplexity";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

// Define the output schema for fill-in-the-blank questions
const fillInTheBlankSchema = z.object({
  questions: z.array(z.object({
    sentence: z.string().describe("The sentence with a blank to be filled in"),
    answer: z.string().describe("The correct answer for the blank"),
    hint: z.string().describe("A helpful hint for the blank"),
  })).describe("An array of fill-in-the-blank questions"),
});

// Create the parser
const parser = StructuredOutputParser.fromZodSchema(fillInTheBlankSchema);

// Create the prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert at creating educational fill-in-the-blank questions.
Given the following text, create 3-5 fill-in-the-blank questions that test understanding of key concepts.
Each blank should be for an important term or concept that is central to the text's meaning.

Text: {text}

{format_instructions}

IMPORTANT RULES:
1. Generate exactly 5-7 different fill-in-the-blank questions from the text
2. Each sentence must be:
   - Grammatically correct and make sense with the blank
   - Preserve the original context from the text
   - Be clear and unambiguous
3. Each answer must be:
   - A single word or at most 2-3 words
   - A meaningful term, concept, or key phrase (NOT articles, prepositions, or common words)
   - Something that tests understanding of the text's main concepts
   - A term that appears in the original text (no paraphrasing)
4. Each hint should be:
   - Helpful but not give away the answer
   - Provide context or a related concept
   - Be 1-2 sentences maximum
5. Never hallucinate or make up information not present in the text
6. Each blank should be represented by "_____" in the sentence
7. Avoid blanks for:
   - Articles (a, an, the)
   - Prepositions (in, on, at, etc.)
   - Common verbs (is, are, was, etc.)
   - Generic adjectives (good, bad, big, etc.)
   - Any word that doesn't test understanding of the text
8. Question Distribution:
   - Spread questions throughout different parts of the text
   - Cover different main concepts or ideas
   - Mix both factual and conceptual understanding
   - Include at least one question about a key definition or term
9. Difficulty Level:
   - Aim for medium difficulty
   - Questions should be challenging but solvable with the given text
   - Avoid overly obvious or extremely obscure answers
`);

export async function generateFillInTheBlank(text: string) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
  }

  const model = new ChatPerplexity({
    apiKey: process.env.PERPLEXITY_API_KEY,
    model: "sonar-medium-online", // Using the SONAR model
  });

  const formatInstructions = parser.getFormatInstructions();

  const prompt = await promptTemplate.format({
    text,
    format_instructions: formatInstructions,
  });

  try {
    const response = await model.invoke(prompt);
    const parsedOutput = await parser.parse(response.content.toString());
    
    return parsedOutput.questions;
  } catch (error) {
    console.error("Error generating fill-in-the-blank:", error);
    throw new Error("Failed to generate fill-in-the-blank questions");
  }
} 