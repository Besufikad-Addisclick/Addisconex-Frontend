import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Navigation configuration based on user_type (from DashboardHeader)
const navItems = [
  {
    label: 'Home',
    path: '/dashboard',
    allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin', 'individuals', 'agencies', 'investors', 'professionals'],
  },
  {
    label: 'Materials',
    path: '/dashboard/materials',
    allowedTypes: ['contractors', 'subcontractors', 'consultants', 'admin', 'individuals', 'agencies', 'investors'],
  },
  {
    label: 'Post',
    path: '/dashboard/material-prices',
    allowedTypes: ['suppliers', 'admin'],
  },
  {
    label: 'Machineries',
    path: '/dashboard/machineries',
    allowedTypes: ['contractors', 'subcontractors', 'consultants', 'admin', 'individuals', 'agencies', 'investors'],
  },
  {
    label: 'Subcontractors',
    path: '/dashboard/subcontractors',
    allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin', 'individuals', 'agencies'],
  },
  {
    label: 'Consultants',
    path: '/dashboard/consultants',
    allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin', 'individuals', 'agencies', 'investors'],
  },
  {
    label: 'Contractors',
    path: '/dashboard/othercontractors',
    allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin', 'individuals', 'agencies'],
  },
  {
    label: 'Agencies',
    path: '/dashboard/agencies',
    allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin', 'individuals', 'agencies', 'investors'],
  },
  {
    label: 'Professionals',
    path: '/dashboard/professionals',
    allowedTypes: ['contractors', 'suppliers', 'subcontractors', 'consultants', 'admin', 'professionals', 'individuals', 'agencies', 'investors'],
  },
];

// Helper function to check if user has access to a specific dashboard route
function hasAccessToRoute(userType: string, pathname: string, currentPackageName?: string): boolean {
  // Admin can access all pages
  if (userType === 'admin') {
    console.log("Middleware - admin access granted for:", pathname);
    return true;
  }
  
  // Allow access to main dashboard for all authenticated users
  if (pathname === '/dashboard') {
    return true;
  }
  
  // Allow access to profile route for all authenticated users
  if (pathname === '/dashboard/profile') {
    return true;
  }
  
  // Check package-based access for specific routes
  if (pathname === '/dashboard/material-prices') {
    const allowedPackages = ['Material Supplier - Essential', 'Material Supplier - Pro'];
    const hasPackageAccess = !!(currentPackageName && allowedPackages.includes(currentPackageName));
    console.log("Middleware - material-prices access check:", { currentPackageName, hasPackageAccess });
    return hasPackageAccess;
  }
  
  if (pathname === '/dashboard/machineries-prices') {
    const allowedPackages = ['Machinery Supplier - Essential', 'Machinery Supplier - Pro'];
    const hasPackageAccess = !!(currentPackageName && allowedPackages.includes(currentPackageName));
    console.log("Middleware - machineries-prices access check:", { currentPackageName, hasPackageAccess });
    return hasPackageAccess;
  }
  
  // Check package-based access for Pro-only routes
  if (pathname === '/dashboard/subcontractors' || pathname === '/dashboard/othercontractors') {
    const allowedPackages = ['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Pro', 'Premium', 'Consultant - Pro', 'PRO'];
    const hasPackageAccess = !!(currentPackageName && allowedPackages.includes(currentPackageName));
    console.log("Middleware - Pro-only route access check:", { pathname, currentPackageName, hasPackageAccess });
    return hasPackageAccess;
  }
  
  // Check package-based access for Premium-only routes (contractors, consultants, and investors)
  if (pathname === '/dashboard/agencies' || pathname === '/dashboard/professionals' || pathname === '/dashboard/consultants' || pathname === '/dashboard/machineries') {
    const allowedPackages = ['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Agency - Pro', 'Premium', 'Consultant - Pro', 'PRO'];
    const hasPackageAccess = !!(currentPackageName && allowedPackages.includes(currentPackageName));
    console.log("Middleware - Premium-only route access check:", { pathname, currentPackageName, hasPackageAccess });
    return hasPackageAccess;
  }
  
  // Check package-based access for contractor/consultant/subcontractor materials (Essential/Pro/Premium/Consultant packages)
  if (pathname === '/dashboard/materials') {
    const allowedPackages = ['Essential', 'Pro', 'Premium', 'Consultant - Essential', 'Consultant - Pro', 'PRO'];
    const hasPackageAccess = !!(currentPackageName && allowedPackages.includes(currentPackageName));
    console.log("Middleware - Materials route access check:", { pathname, currentPackageName, hasPackageAccess });
    return hasPackageAccess;
  }
  
  // Handle detail pages by checking if pathname matches a detail page pattern
  const detailPagePatterns = [
    '/dashboard/materials/[id]',
    '/dashboard/subcontractors/[id]',
    '/dashboard/consultants/[id]',
    '/dashboard/othercontractors/[id]',
    '/dashboard/agencies/[id]',
    '/dashboard/professionals/[id]',
    '/dashboard/suppliers/[id]',
    '/dashboard/constructionWorkers/[id]'
  ];
  
  // Check if this is a detail page
  for (const pattern of detailPagePatterns) {
    const basePath = pattern.replace('/[id]', '');
    if (pathname.startsWith(basePath + '/') && pathname !== basePath) {
      // This is a detail page, apply the same access control as the base path
      console.log("Middleware - detail page access check:", { pathname, basePath, userType, currentPackageName });
      
      // Apply the same package restrictions as the base path
      if (basePath === '/dashboard/materials') {
        const allowedPackages = ['Essential', 'Pro', 'Premium', 'Consultant - Essential', 'Consultant - Pro', 'PRO'];
        const hasPackageAccess = !!(currentPackageName && allowedPackages.includes(currentPackageName));
        return hasPackageAccess;
      } else if (basePath === '/dashboard/subcontractors' || basePath === '/dashboard/othercontractors') {
        const allowedPackages = ['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Pro', 'Premium', 'Consultant - Pro', 'PRO'];
        const hasPackageAccess = !!(currentPackageName && allowedPackages.includes(currentPackageName));
        return hasPackageAccess;
      } else if (basePath === '/dashboard/agencies' || basePath === '/dashboard/professionals' || basePath === '/dashboard/consultants' || basePath === '/dashboard/machineries') {
        const allowedPackages = ['Material Supplier - Pro', 'Machinery Supplier - Pro', 'Agency - Pro', 'Premium', 'Consultant - Pro', 'PRO'];
        const hasPackageAccess = !!(currentPackageName && allowedPackages.includes(currentPackageName));
        return hasPackageAccess;
      } else {
        // For other detail pages, check user type
        const baseRoute = navItems.find(item => item.path === basePath);
        if (baseRoute) {
          return baseRoute.allowedTypes.includes(userType);
        }
      }
    }
  }
  
  // Find the most specific matching route (longest path match)
  const matchingRoutes = navItems.filter(item => 
    item.path && pathname.startsWith(item.path)
  ).sort((a, b) => (b.path?.length || 0) - (a.path?.length || 0));
  
  console.log("Middleware - matching routes for", pathname, ":", matchingRoutes.map(r => r.path));
  
  if (matchingRoutes.length > 0) {
    const route = matchingRoutes[0]; // Get the most specific match
    console.log("Middleware - selected route:", route.path, "allowedTypes:", route.allowedTypes, "userType:", userType);
    const hasAccess = route.allowedTypes.includes(userType);
    console.log("Middleware - access check result:", hasAccess);
    return hasAccess;
  }
  
  // Allow access to other dashboard sub-routes by default
  return true;
}

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
      console.log("Middleware - dashboard route:", pathname, "token exists:", !!token);
      if (!token) {
        return NextResponse.redirect(
          new URL(
            `/auth/login?callbackUrl=${encodeURIComponent(req.url)}`,
            req.url
          )
        );
      }

      // Check role-based access
      const userType = token.userType;
      const currentPackageName = token.currentPackageName;
      console.log("Middleware - userType:", userType, "pathname:", pathname, "currentPackageName:", currentPackageName);
      
      const hasAccess = hasAccessToRoute(userType, pathname, currentPackageName);
      console.log("Middleware - hasAccess result:", hasAccess);
      
      if (!hasAccess) {
        console.log("Middleware - access denied for userType:", userType, "to path:", pathname);
        
        // Prevent redirect loops - if we're already at the default dashboard, don't redirect
        if (pathname === '/dashboard') {
          console.log("Middleware - already at dashboard, allowing access to prevent loop");
          return NextResponse.next();
        }
        
        // Redirect to user's default dashboard based on their role
        let defaultDashboard = '/dashboard';
        
        // Only agencies and professionals get their specific dashboards
        if (userType === 'agencies') {
          defaultDashboard = '/dashboard/agencies';
        } else if (userType === 'professionals') {
          defaultDashboard = '/dashboard/professionals';
        } else {
          // All other user types (contractors, suppliers, subcontractors, consultants, admin, individuals, etc.)
          // should only access the main dashboard
          defaultDashboard = '/dashboard';
        }
        
        console.log("Middleware - redirecting to:", defaultDashboard);
        return NextResponse.redirect(new URL(defaultDashboard, req.url));
      }

      // Check subscription status with caching
      try {
        
        console.log("token:", token);
        

        let subscriptionData;

        // Use cached data if available and not expired
        
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
            console.log("Middleware - subscription data:", subscriptionData);
          }
        

        if (subscriptionData) {
          console.log("Middleware - processing subscription data");
          // If user has pending subscription, redirect to checkout
          if (subscriptionData.subscription?.status === "pending") {
            console.log("Middleware - redirecting to checkout (pending subscription)");
            return NextResponse.redirect(new URL("/checkout", req.url));
          }
          
          // If user has active subscription, allow access to dashboard
          if (subscriptionData.has_active_subscription) {
            console.log("Middleware - user has active subscription");
            const verificationExpiresAt = token.verificationExpiresAt;
            
            

            if (
              !verificationExpiresAt || // null or undefined
              new Date(verificationExpiresAt).getTime() < Date.now() // already expired
            ) {
              console.log("Middleware - redirecting to profile completion (verification expired)");
              return NextResponse.redirect(
                new URL("/profile-completion", req.url)
              );
            }

            // Verified & active subscription → allow dashboard access
            console.log("Middleware - allowing dashboard access (verified & active)");
            return NextResponse.next();
          }
          if (subscriptionData.subscription?.status === "approved") {
            console.log("Middleware - subscription approved, allowing access");
            // Don't redirect here - let the role-based redirect in login page handle it
            return NextResponse.next();
          }

          console.log("Middleware - no subscription, redirecting to choose plan");
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
