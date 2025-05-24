"use server"

import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function updateNameAction(data: { name: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/sign-in")
  }
  
  await prisma.user.update({
    where: { id: user.id },
    data: { name: data.name }
  })

  redirect("/protected")
} 