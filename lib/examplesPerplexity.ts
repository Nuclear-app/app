import { ChatPerplexity } from "@langchain/community/chat_models/perplexity";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

// Define the output schema for fill-in-the-blank questions
const examplesSchema = z.object({
  topics: z.array(z.object({
    topic: z.string().describe("The topic as detected by the model"),
    examples: z.array(z.object({
        example: z.string().describe("The example generated from the topic with its description"),
    })),
  })),
});

// Create the parser
const parser = StructuredOutputParser.fromZodSchema(examplesSchema);

// Create the prompt template
const promptTemplate = PromptTemplate.fromTemplate(`
You are an expert at detecting key concepts given in an educational text.
Given the following text, you need to detect the key concepts in the text 
(prefarably based on topics that that you can generate examples for).

You are also an expert at generating examples/applications for these key concepts preferably
that are related to the educational text (but not necessarily).
Given each key concept, you need to generate 2-3 examples that helps 
the reader understand the key concept and the concept's role in the educational text.

Text: {text}

{format_instructions}

IMPORTANT RULES:

1. Each key concept should:
   - be directly related to the educational text that is provided. 
   - contain a key term that is well known in the literature of that subject.
   - be a concept that you can generate examples for that amplify the understanding of the key concept as well as the educational text.
   - be grammatically correct and make sense with the educational text.
   - be clear and unambiguous.
   - not be more than 10 words.
   - contain a meaningful term, or key phrase from the educational text.

2. Do not hallucinate or make up key concepts that are not present in the educational text.

3. You need to generate 2-3 examples for each key concept.

4. Each example should:
    - be grammatically correct and make sense with the educational text.
    - be clear and unambiguous.
    - be directly be related to the key concept.
    - be a good appplication of the key concept.
    - atleast be more than 2-3 words.

5. Each example should also contain a description of how the example is related to the key concept (in the format this should be stored with the example itself).

6. Each description should: 
    - Most importantly, give a detailed explanation of how the example is a good application of the key concept.
    - Try to give real life examples where its possible give detailed elaboration on the pre-context of that example and how the concept is demonstrated in context of that example.
    - be grammatically correct and make sense with the educational text.
    - be clear and unambiguous.
    - be directly be related to the key concept.
    - should atleast be 2 sentences
`);


export async function generateExamples(text: string) {
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
    
    return parsedOutput;
  } catch (error) {
    console.error("Error generating fill-in-the-blank:", error);
    throw new Error("Failed to generate fill-in-the-blank questions");
  }
}


