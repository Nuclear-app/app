"use server"

import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { updateUser } from "@/lib/user"

export async function updateNameAction(data: { name: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/sign-in")
  }
  
  await updateUser(user.id, { name: data.name })

  redirect("/protected")
} 