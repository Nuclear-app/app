import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    // Check if this is a new sign up by looking at the created_at timestamp
    // If the user was created within the last minute, they are considered new
    const isNewUser = user && (
      new Date().getTime() - new Date(user.created_at).getTime() < 60000 || // within last minute
      user.user_metadata?.is_new_signup || // has new signup flag
      user.app_metadata?.provider === 'google' || // is a Google sign-in
      user.app_metadata?.provider === 'github' || // is a GitHub sign-in
      user.app_metadata?.provider === 'discord' // is a Discord sign-in
    );

    // Redirect unauthenticated users to sign-in for protected routes
    if ((request.nextUrl.pathname.startsWith("/dashboard") ||
         request.nextUrl.pathname.startsWith("/mode-specific")) && 
        error)
    {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Handle root path and post-authentication redirects
    if (!error) {
      // For root path or /protected path
      if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/protected") {
        if (isNewUser) {
          return NextResponse.redirect(new URL("/onboarding/name", request.url));
        } else {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }

      // Prevent authenticated users from accessing auth pages
      if (request.nextUrl.pathname.startsWith("/sign-in") || 
          request.nextUrl.pathname.startsWith("/sign-up")) 
      {
        if (isNewUser) {
          return NextResponse.redirect(new URL("/onboarding/name", request.url));
        } else {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
