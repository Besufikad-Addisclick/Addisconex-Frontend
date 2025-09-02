'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: string;
  fallbackUrl?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType,
  fallbackUrl = '/auth/login',
}) => {
  const { session, status, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(fallbackUrl);
    }
  }, [status, router, fallbackUrl]);

  useEffect(() => {
    if (isAuthenticated && requiredUserType && session?.user?.userType !== requiredUserType) {
      // Redirect to appropriate dashboard based on user type
      const userTypeRoutes: Record<string, string> = {
        contractor: '/dashboard',
        supplier: '/dashboard/supplier',
        subcontractor: '/dashboard/subcontractor',
        consultant: '/dashboard/consultant',
        admin: '/dashboard/admin',
      };
      
      const userType = session?.user?.userType;
const redirectUrl = userType ? userTypeRoutes[userType] || '/dashboard' : '/dashboard';
router.push(redirectUrl);
    }
  }, [isAuthenticated, requiredUserType, session, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (requiredUserType && session?.user?.userType !== requiredUserType) {
    return null; // Will redirect to appropriate dashboard
  }

  return <>{children}</>;
};
