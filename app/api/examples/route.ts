import { NextResponse } from 'next/server';
import { generateExamples } from '@/lib/examplesPerplexity';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get('blockId');
  const text = searchParams.get('text');

  const topics = await prisma.topic.findMany({
    where: {
      blockId: blockId as string,
    },
  });

  return NextResponse.json({ topics });
}




export async function POST(req: Request) {
  try {
    const { blockId, text } = await req.json();

    if (!blockId || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate examples using the perplexity model
    const examples = await generateExamples(text);

    console.log(examples);
    // Create topics in the database
    const createdTopics = await Promise.all(
      examples.topics.map(async (topic) => {
        return await prisma.topic.create({
          data: {
            id: nanoid(),
            name: topic.topic,
            examples: topic.examples.map(ex => ex.example), // Convert example objects to strings
            blockId: blockId,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      data: createdTopics,
    });
  } catch (error) {
    console.error('Error generating examples:', error);
    return NextResponse.json(
      { error: 'Failed to generate examples' },
      { status: 500 }
    );
  }
} 