import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const isNewSignup = searchParams.get('is_new_signup') === 'true'
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user after successful auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        try {
          // Check if user exists in Prisma
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id }
          })

          // If user doesn't exist in Prisma, create them
          if (!existingUser) {
            await prisma.user.create({
              data: {
                id: user.id,
                email: user.email!,
                name: null, // Can be updated later
              }
            })

            // Set user metadata to indicate this is a new signup
            await supabase.auth.updateUser({
              data: { is_new_signup: true }
            })
          }
        } catch (error) {
          console.error('Error handling Prisma user:', error)
          // Continue with redirect even if Prisma operation fails
          // The user can still use the app, and we can handle the Prisma sync later
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const redirectUrl = new URL(
        isNewSignup ? '/onboarding/name' : next,
        isLocalEnv ? origin : `https://${forwardedHost}`
      )

      return NextResponse.redirect(redirectUrl)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

