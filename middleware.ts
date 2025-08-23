import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Skip middleware for public routes
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
      return NextResponse.next();
    }

    // Check for dashboard routes
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
      
      // Check subscription status for authenticated users
      try {
        
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
          const data = await response.json();

          console.log("Subscription chek data:", data);
          // If user has active subscription, allow access to dashboard
          if (data.has_active_subscription) {
            return NextResponse.next();
          }

          // If user has pending subscription, redirect to checkout
          if (
            data.subscription &&
            data.subscription.status === "pending"
          ) {
            return NextResponse.redirect(new URL("/checkout", req.url));
          }

          // If no subscription, redirect to choose plan
          return NextResponse.redirect(new URL("/choose-plan", req.url));
        }
      } catch (error) {
        console.log("Subscription check failed:", error);
        // On error, redirect to choose plan as fallback
        return NextResponse.redirect(new URL("/choose-plan", req.url));
      }
    }
    console.log("Middleware token:", token?.name);
    // Check for checkout route
    if (pathname === "/checkout") {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
      // Allow access to checkout for authenticated users
      return NextResponse.next();
    }

    // Check for choose-plan route
    if (pathname === "/choose-plan") {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
      // Allow access to choose-plan for authenticated users
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
