import { ChatPerplexity } from "@langchain/community/chat_models/perplexity";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { fetchContext } from "@/app/modeSpecific/fileInput/actions";
import { JSONContent } from "novel";
import prisma from "@/lib/prisma";

// Define the output schema for notes that matches Novel's format exactly
const noteSchema = z.object({
  content: z.array(z.object({
    type: z.enum(["paragraph", "heading", "bulletList", "orderedList"]),
    content: z.array(z.object({
      type: z.enum(["text", "listItem", "paragraph"]),
      text: z.string().optional(),
      marks: z.array(z.object({
        type: z.enum(["bold", "italic", "code", "underline", "strike"]),
        attrs: z.record(z.any()).optional()
      })).optional(),
      attrs: z.object({
        level: z.number().optional(),
        class: z.string().optional()
      }).optional()
    }))
  }))
});

// Create the parser
const parser = StructuredOutputParser.fromZodSchema(noteSchema);

// Create the prompt template
const promptTemplate = PromptTemplate.fromTemplate(
  `You are an expert at creating well-structured, educational notes.
Given the following text, create comprehensive notes that capture the key concepts, ideas, and relationships.

Text: {text}

{format_instructions}

IMPORTANT RULES:
1. Structure the notes in a clear, hierarchical format
2. Use proper formatting:
   - Headings (type: "heading") for main topics with level: 1, 2, or 3
   - Bullet points (type: "bulletList") for key points
   - Ordered lists (type: "orderedList") for sequential items
   - Paragraphs (type: "paragraph") for regular text
3. Text formatting:
   - Use "bold" mark for key terms
   - Use "italic" mark for definitions
   - Use "code" mark for technical terms
   - Use "underline" mark for emphasis
   - Use "strike" mark for deprecated concepts
4. Include:
   - Main concepts and their relationships
   - Key definitions
   - Important examples
   - Supporting details
5. Format requirements:
   - Each heading must have attrs: { level: number }
   - Each text node must have type: "text"
   - Each list item must have type: "listItem"
   - Each paragraph must have type: "paragraph"
6. Never hallucinate or add information not present in the text
7. Keep the structure clean and consistent
8. Ensure all content is properly nested in the JSON structure
9. Maintain proper indentation and hierarchy
10. Each section should flow logically from the previous one

The output should be a valid JSON object with the following structure:
- type: "doc"
- content: array of content blocks
  - Each block should have a type ("heading", "paragraph", "bulletList", "orderedList")
  - Each block should have content array with text nodes
  - Text nodes should have type: "text" and optional marks array for formatting
  - Headings should have attrs with level property`
);

export async function saveNotesToBlock(blockId: string, notes: JSONContent) {
  try {
    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: { 
        note: notes,
        // Optionally update the title based on the first heading if it exists
        title: notes.content?.[0]?.type === "heading" 
          ? notes.content[0].content?.[0]?.text || "Untitled Note"
          : "Untitled Note"
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

export async function generateNotes(blockId: string): Promise<JSONContent> {
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

    const formatInstructions = parser.getFormatInstructions();

    const prompt = await promptTemplate.format({
      text: context,
      format_instructions: formatInstructions,
    });

    const response = await model.invoke(prompt);
    const parsedOutput = await parser.parse(response.content.toString());
    
    // Ensure the output matches Novel's JSONContent format
    const novelContent: JSONContent = {
      type: "doc",
      content: parsedOutput.content
    };

    // Save the notes to the block
    const saveResult = await saveNotesToBlock(blockId, novelContent);
    if (!saveResult.success) {
      throw new Error(saveResult.error);
    }

    return novelContent;
  } catch (error) {
    console.error("Error generating notes:", error);
    throw new Error("Failed to generate notes");
  }
}
