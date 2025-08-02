import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Function to check if user owns a block via API call
async function checkBlockOwnership(blockId: string, userId: string): Promise<boolean> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    console.log(`Checking block ownership for block ${blockId} and user ${userId} at ${siteUrl}`);
    
    const response = await fetch(`${siteUrl}/api/auth/check-block-ownership`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ blockId, userId }),
    });
    
    console.log(`Block ownership check response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`Block ownership check failed with status: ${response.status}`);
      return false;
    }
    
    const result = await response.json();
    console.log(`Block ownership result:`, result);
    return result.hasAccess;
  } catch (error) {
    console.error("Error checking block ownership:", error);
    // In case of error, allow access to prevent blocking legitimate users
    return true;
  }
}

// Function to check if user owns a crate via API call
async function checkCrateOwnership(crateId: string, userId: string): Promise<boolean> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    console.log(`Checking crate ownership for crate ${crateId} and user ${userId} at ${siteUrl}`);
    
    const response = await fetch(`${siteUrl}/api/auth/check-crate-ownership`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ crateId, userId }),
    });
    
    console.log(`Crate ownership check response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`Crate ownership check failed with status: ${response.status}`);
      return false;
    }
    
    const result = await response.json();
    console.log(`Crate ownership result:`, result);
    return result.hasAccess;
  } catch (error) {
    console.error("Error checking crate ownership:", error);
    // In case of error, allow access to prevent blocking legitimate users
    return true;
  }
}

// Function to extract resource ID from URL
function extractResourceId(pathname: string): { type: 'block' | 'crate' | null, id: string | null } {
  // Match /dashboard/block/[id] and its sub-routes
  const blockMatch = pathname.match(/^\/dashboard\/block\/([^\/]+)/);
  if (blockMatch) {
    return { type: 'block', id: blockMatch[1] };
  }

  // Match /dashboard/crate/[id]
  const crateMatch = pathname.match(/^\/dashboard\/crate\/([^\/]+)/);
  if (crateMatch) {
    return { type: 'crate', id: crateMatch[1] };
  }

  // Match API routes
  const apiBlockMatch = pathname.match(/^\/api\/blocks\/([^\/]+)/);
  if (apiBlockMatch) {
    return { type: 'block', id: apiBlockMatch[1] };
  }

  const apiCrateMatch = pathname.match(/^\/api\/crates\/([^\/]+)/);
  if (apiCrateMatch) {
    return { type: 'crate', id: apiCrateMatch[1] };
  }

  return { type: null, id: null };
}

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
      new Date().getTime() - new Date(user.created_at).getTime() < 60000
    );

    // Define protected routes that require authentication
    const protectedRoutes = [
      "/dashboard",
      "/modeSpecific", 
      "/onboarding",
      "/protected",
      "/api/blocks",
      "/api/crates",
      "/api/examples",
      "/api/quizzes",
      "/api/ocr",
      "/api/facts",
      "/api/generate",
      "/api/upload",
      "/api/fill-in-blank"
    ];

    // Check if current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );

    // Redirect unauthenticated users to sign-in for protected routes
    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Temporarily disable ownership checks to fix the redirect issue
    // We'll handle ownership checks at the component level instead
    // if (user && isProtectedRoute) {
    //   const { type, id } = extractResourceId(request.nextUrl.pathname);
    //   
    //   if (type && id) {
    //     let hasAccess = false;
    //     
    //     if (type === 'block') {
    //       hasAccess = await checkBlockOwnership(id, user.id);
    //     } else if (type === 'crate') {
    //       hasAccess = await checkCrateOwnership(id, user.id);
    //     }

    //     if (!hasAccess) {
    //       return NextResponse.redirect(new URL("/dashboard", request.url));
    //     }
    //   }
    // }

    // Handle root path and post-authentication redirects
    if (user) {
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
