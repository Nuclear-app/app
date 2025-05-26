"use server"

import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function updateContext(data: { blockId: string, context: string }) {  
  await prisma.block.update({
    where: { id: data.blockId },
    data: { context: data.context }
  })
}

// const blockId = "3dcebc5d-4087-4b14-8cd2-6e074b0baf2b"
// const context = "This is a test context"

// updateContext({ blockId, context })