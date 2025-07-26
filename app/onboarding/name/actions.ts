"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { updateUser, getUserByEmail } from "@/lib/user"


export async function updateNameAction(data: { name: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/sign-in")
  }

  console.log("user email: ", user.email)
  console.log("user id: ", user.id)
  // Find user by email (more reliable than ID)
  const dbUser = await getUserByEmail(user.email!)
  
  if (!dbUser) {
    console.error("User not found in database")
    redirect("/sign-in")
  }
  
  // Use Prisma abstraction function
  await updateUser(dbUser.id, { name: data.name })

  redirect("/onboarding/name/study-type")
} 