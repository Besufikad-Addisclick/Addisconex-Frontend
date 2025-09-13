"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasPageAccess, UserAccess } from "@/lib/access-control";
import { Loader, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    // Check if user has access to current page
    const userAccess: UserAccess = {
      userType: session.user.userType || 'unknown',
      currentPackageName: session.user.currentPackageName,
    };

    const hasAccess = hasPageAccess(userAccess, pathname);

    if (!hasAccess) {
      setIsChecking(false);
      return;
    }

    setIsChecking(false);
  }, [session, status, pathname, router]);

  if (status === "loading" || isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-gray-700">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect to signin
  }

  const userAccess: UserAccess = {
    userType: session.user.userType || 'unknown',
    currentPackageName: session.user.currentPackageName,
  };

  const hasAccess = hasPageAccess(userAccess, pathname);

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>User Type:</strong> {session.user.userType}
              </p>
              {session.user.currentPackageName && (
                <p className="text-sm text-gray-700">
                  <strong>Package:</strong> {session.user.currentPackageName}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/profile">
                  View Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}