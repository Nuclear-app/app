"use server"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UpdateNameForm } from "@/components/update-name-form"
import prisma from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { updateNameAction } from "./actions"

export default async function UpdateNamePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true }
  })

  return (
    <div className="container flex items-center justify-center min-h-screen py-12 w-full">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">What should we call you?</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateNameForm onSubmit={updateNameAction} defaultName={dbUser?.name} />
        </CardContent>
      </Card>
    </div>
  )
} 