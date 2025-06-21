import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { crateId, userId } = await request.json();

    if (!crateId || !userId) {
      return NextResponse.json({ hasAccess: false }, { status: 400 });
    }

    const crate = await prisma.folder.findFirst({
      where: {
        id: crateId,
        authorId: userId
      },
      select: { id: true }
    });

    return NextResponse.json({ hasAccess: !!crate });
  } catch (error) {
    console.error("Error checking crate ownership:", error);
    return NextResponse.json({ hasAccess: false }, { status: 500 });
  }
} 