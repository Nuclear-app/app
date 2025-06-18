"use server"

import { ChatPerplexity } from "@langchain/community/chat_models/perplexity";
import { PromptTemplate } from "@langchain/core/prompts";
import { fetchContext } from "@/app/modeSpecific/fileInput/actions";
import { JSONContent } from "novel";
import prisma from "@/lib/prisma";
import { markdownToJSONContent } from "@/lib/markdownToJSON";

// Create the prompt template for Markdown output
const promptTemplate = PromptTemplate.fromTemplate(
  `You are an expert at creating well-structured, educational notes in Markdown format.
Your task is to convert the given text into clear, organized notes using proper Markdown formatting.

Text to convert: {text}

FORMATTING GUIDELINES:
1. Use # for main headings, ## for subheadings, ### for sub-subheadings
2. Use bullet points (- or *) for key concepts and ideas
3. Use numbered lists (1. 2. 3.) for sequential steps or processes
4. Use **bold** for key terms and important concepts
5. Use *italic* for definitions and emphasis
6. Use \`code\` for technical terms, code snippets, or file names
7. Use ~~strikethrough~~ for deprecated or outdated concepts
8. Use > for important quotes or callouts
9. Use proper spacing between sections for readability

STRUCTURE GUIDELINES:
1. Start with a main heading that summarizes the topic
2. Break down complex topics into logical sections with subheadings
3. Use bullet points to list key points, features, or concepts
4. Use numbered lists for step-by-step processes or procedures
5. Include relevant examples where helpful
6. Summarize important takeaways at the end if appropriate

EXAMPLE OUTPUT:
# Main Topic

## Key Concepts
- **Concept 1**: Brief explanation
- **Concept 2**: Brief explanation with *emphasis*

## Step-by-Step Process
1. First step with details
2. Second step with \`technical term\`
3. Third step with important note

## Important Notes
> This is a key insight or warning that should be highlighted.

Return ONLY the Markdown-formatted notes, no additional text or explanations.`
);

export async function saveNotesToBlock(blockId: string, markdownContent: string) {
  try {
    // Convert markdown to proper Novel JSONContent structure
    const noteJson = markdownToJSONContent(markdownContent);

    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: { 
        note: JSON.stringify(noteJson),
        // Extract title from first heading if it exists
        title: markdownContent.match(/^#\s+(.+)$/m)?.[1] || "Untitled Note"
      },
      select: {
        id: true,
        title: true,
        note: true
      }
    });

    return { success: true, data: updatedBlock };
  } catch (error) {
    console.error("Error saving notes to block:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save notes to block" 
    };
  }
}

export async function generateNotes(blockId: string): Promise<string> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
  }

  try {
    // Fetch the context from the block
    const context = await fetchContext(blockId);
    if (!context) {
      throw new Error("No context found for the block");
    }

    const model = new ChatPerplexity({
      apiKey: process.env.PERPLEXITY_API_KEY,
      model: "sonar", // Using the SONAR model
    });

    const prompt = await promptTemplate.format({
      text: context
    });

    // Get response from the model
    const response = await model.invoke(prompt);
    
    // Extract the content as string
    const responseContent = typeof response.content === 'string' 
      ? response.content 
      : Array.isArray(response.content) 
        ? response.content.map(c => {
            if (typeof c === 'string') return c;
            if ('text' in c) return c.text;
            return '';
          }).join('')
        : '';
    
    // Clean the response - remove any markdown code blocks if present
    const cleanedResponse = responseContent
      .replace(/```markdown\n?|\n?```/g, '')
      .replace(/```\n?|\n?```/g, '')
      .trim();

    console.log("cleanedResponse");
    console.log(cleanedResponse);  
    // Save the markdown notes to the block
    const saveResult = await saveNotesToBlock(blockId, cleanedResponse);
    if (!saveResult.success) {
      throw new Error(`Failed to save notes: ${saveResult.error}`);
    }

    return cleanedResponse;
  } catch (error) {
    console.error("Error generating notes:", error);
    if (error instanceof Error) {
      throw error; // Preserve the original error message
    }
    throw new Error("Failed to generate notes");
  }
}
