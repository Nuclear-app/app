import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { note } = body;

    const updatedBlock = await prisma.block.update({
      where: {
        id: params.id,
      },
      data: {
        note,
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
