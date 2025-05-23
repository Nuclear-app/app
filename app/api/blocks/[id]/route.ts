import { NextResponse } from 'next/server';
import prisma  from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { Note } = body;

    const updatedBlock = await prisma.block.update({
      where: {
        id: params.id,
      },
      data: {
        Note,
      },
    });

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json(
      { error: 'Failed to update block' },
      { status: 500 }
    );
  }
} 