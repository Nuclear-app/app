"use client"

import { z } from "zod"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export type FormSchema = z.infer<typeof formSchema>

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
