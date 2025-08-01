"use server"

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UpdateNameForm } from "@/components/update-name-form"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getUserByEmail } from "@/lib/user"
import { updateNameAction } from "./actions"

export default async function UpdateNamePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  // Use Prisma abstraction function
  const dbUser = await getUserByEmail(user.email!)

  return (
    <div className="
    border rounded-3xl w-11/12 container flex items-center justify-center min-h-screen py-12 w-full
    bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-green-600/40 via-purple-600/40 to-orange-600/40 bg-black/50 p-6 md:p-10">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-5xl text-center">What should we call you?</CardTitle>
        </CardHeader>
        <CardContent className="w-3/4 flex justify-center mx-auto">
          <UpdateNameForm onSubmit={updateNameAction} defaultName={dbUser?.name} />
        </CardContent>
      </Card>
    </div>
  )
} 