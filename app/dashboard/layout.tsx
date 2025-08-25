"use client";

// app/dashboard/layout.tsx
import { SessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import './../globals.css';


function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session:', session);
    
    if (status === 'loading') {
      setAuthLoading(true);
      return;
    }
    
    
    // if (session?.error === 'RefreshAccessTokenError') {
    //   console.log('Token refresh failed, redirecting to login');
    //   router.push('/auth/login');
    //   return;
    // }
    
    // if (status === 'unauthenticated' || !session?.user) {
    //   setAuthLoading(false);
    //   router.push('/auth/login');
    //   return;
    // }
  },  [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <>
      <DashboardHeader />
      <main className="max-w-[1650px] px-2 mx-auto py-8">{children}</main>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}