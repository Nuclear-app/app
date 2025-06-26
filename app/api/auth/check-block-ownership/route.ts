import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { blockId, userId } = await request.json();

    if (!blockId || !userId) {
      return NextResponse.json({ hasAccess: false }, { status: 400 });
    }

    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        authorId: userId
      },
      select: { id: true }
    });

    return NextResponse.json({ hasAccess: !!block });
  } catch (error) {
    console.error("Error checking block ownership:", error);
    return NextResponse.json({ hasAccess: false }, { status: 500 });
  }
} 