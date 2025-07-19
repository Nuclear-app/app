import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    const { blockId, userId } = await request.json();

    if (!blockId) {
      return NextResponse.json({ hasAccess: false }, { status: 400 });
    }

    // If userId is not provided, get it from the session
    let currentUserId = userId;
    if (!currentUserId) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {
              // Not needed for this operation
            },
          },
        },
      );

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return NextResponse.json({ hasAccess: false }, { status: 401 });
      }
      currentUserId = user.id;
    }

    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        authorId: currentUserId
      },
      select: { id: true }
    });

    return NextResponse.json({ hasAccess: !!block });
  } catch (error) {
    console.error("Error checking block ownership:", error);
    return NextResponse.json({ hasAccess: false }, { status: 500 });
  }
} 