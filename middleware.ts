import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Cache for subscription status to avoid repeated API calls
const subscriptionCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Skip middleware for public routes
    if (
      [
        "/auth/login",
        "/auth/signup",
        "/auth/forgot-password",
        "/subscription/success",
        "/subscription/failure",
        "/",
        "/pricing",
        "/service",
        "/contact",
        "/blog",
        "/products",
      ].includes(pathname) ||
      pathname.startsWith("/blog/") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/")
    ) {
      return NextResponse.next();
    }

    // Check for dashboard routes
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(
          new URL(
            `/auth/login?callbackUrl=${encodeURIComponent(req.url)}`,
            req.url
          )
        );
      }

      // Check subscription status with caching
      try {
        const userId = token.userId || token.email;
        // console.log("token:", token);
        const cacheKey = `subscription_${userId}`;
        const cached = subscriptionCache.get(cacheKey);

        let subscriptionData;

        // Use cached data if available and not expired
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          subscriptionData = cached.data;
        } else {
          // Fetch fresh data
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
          const response = await fetch(`${apiUrl}/check-subscription/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            subscriptionData = await response.json();
            // Cache the result
            subscriptionCache.set(cacheKey, {
              data: subscriptionData,
              timestamp: Date.now(),
            });
          }
        }

        if (subscriptionData) {
          // If user has active subscription, allow access to dashboard
          if (subscriptionData.has_active_subscription) {
            const verificationExpiresAt = token.verificationExpiresAt;
            

            if (
              !verificationExpiresAt || // null or undefined
              new Date(verificationExpiresAt).getTime() < Date.now() // already expired
            ) {
              return NextResponse.redirect(
                new URL("/profile-completion", req.url)
              );
            }

            // Verified & active subscription → allow dashboard access
            return NextResponse.next();
          }

          // If user has pending subscription, redirect to checkout
          if (subscriptionData.subscription?.status === "pending") {
            return NextResponse.redirect(new URL("/checkout", req.url));
          }

          // If no subscription, redirect to choose plan
          return NextResponse.redirect(new URL("/choose-plan", req.url));
        }
      } catch (error) {
        console.error("Subscription check failed:", error);
        // On error, redirect to choose plan as fallback
        return NextResponse.redirect(new URL("/choose-plan", req.url));
      }
    }

    // Check for checkout route
    if (pathname === "/checkout") {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
      return NextResponse.next();
    }

    // Check for choose-plan route
    if (pathname === "/choose-plan") {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
      return NextResponse.next();
    }
    if (pathname === "/profile-completion") {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        if (
          [
            "/auth/login",
            "/auth/signup",
            "/subscription/success",
            "/subscription/failure",
            "/",
            "/pricing",
            "/service",
            "/contact",
            "/blog",
            "/products",
          ].includes(pathname) ||
          pathname.startsWith("/blog/")
        ) {
          return true;
        }

        // Require authentication for protected routes
        if (
          pathname.startsWith("/dashboard") ||
          pathname === "/checkout" ||
          pathname === "/profile-completion" ||
          pathname === "/choose-plan"
        ) {
          return !!token;
        }

        // Allow access to other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|acx.png|santim.png|logotransparent.png|image.png).*)",
  ],
};
