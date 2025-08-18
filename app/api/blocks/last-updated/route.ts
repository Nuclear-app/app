import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const explicitUserId = url.searchParams.get("userId");
    const internalAuthHeader = request.headers.get("x-internal-auth");
    const internalSecret = process.env.INTERNAL_API_SECRET;

    if (explicitUserId && internalSecret && internalAuthHeader === internalSecret) {
      const lastBlock = await prisma.block.findFirst({
        where: { authorId: explicitUserId },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });
      return NextResponse.json({ blockId: lastBlock?.id ?? null });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // not required for a read-only query
          },
        },
      },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ blockId: null }, { status: 200 });
    }

    const lastBlock = await prisma.block.findFirst({
      where: { authorId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    return NextResponse.json({ blockId: lastBlock?.id ?? null });
  } catch (error) {
    console.error("Error fetching last updated block:", error);
    return NextResponse.json({ blockId: null }, { status: 200 });
  }
}


