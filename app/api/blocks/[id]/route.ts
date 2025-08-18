import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const block = await prisma.block.findUnique({ where: { id } });
    if (!block) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(block);
  } catch (error) {
    console.error("Error fetching block by id:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
