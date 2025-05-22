import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateFillInTheBlank } from '@/lib/perplexity';
import { z } from 'zod';

// Input validation schema
const requestSchema = z.object({
  blockId: z.string().min(1, "Block ID is required"),
  text: z.string().min(1, "Text is required")
});

// Types for better type safety
type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

export async function POST(request: Request) {
  try {
    // Validate input
    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error.issues.map(i => i.message).join(", ")
      }, { status: 400 });
    }

    const { blockId, text } = result.data;

    // Verify block exists
    const blockExists = await prisma.block.findUnique({
      where: { id: blockId }
    });

    if (!blockExists) {
      return NextResponse.json({
        success: false,
        error: 'Block not found'
      }, { status: 404 });
    }

    // For testing, using mock data instead of actual API call
    const mockData = {
      questions: [
        {"sentence": "The cat is ____", "answer": "animal", "hint": "They are humans best friends"},
        {"sentence": "The dog is ____", "answer": "animal", "hint": "They are humans best friends"},
        {"sentence": "The fox is ____", "answer": "animal", "hint": "They live in the forest"}
      ]
    };

    const questions = mockData.questions;
    // const questions = await generateFillInTheBlank(text); // Uncomment this when ready to use actual API

    // Delete existing questions for this block (if any)
    await prisma.fillInTheBlank.deleteMany({
      where: { blockId }
    });

    // Create all questions in a single operation
    await prisma.fillInTheBlank.createMany({
      data: questions.map(question => ({
        sentence: question.sentence,
        answer: question.answer,
        hint: question.hint,
        blockId
      }))
    });

    // Fetch the created questions to return
    const createdQuestions = await prisma.fillInTheBlank.findMany({
      where: { blockId }
    });

    return NextResponse.json({
      success: true,
      data: createdQuestions
    });

  } catch (error) {
    console.error('Error creating fill-in-the-blank questions:', error);
    
    // Handle different types of errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input data'
      }, { status: 400 });
    }

    if (error instanceof Error) {
      // Check for specific Prisma errors and handle accordingly
      if (error.name === 'PrismaClientKnownRequestError') {
        return NextResponse.json({
          success: false,
          error: 'Database operation failed'
        }, { status: 409 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 