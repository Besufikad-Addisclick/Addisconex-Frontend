"use client";

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useSessionRefresh() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Refresh session every 5 minutes to keep it up to date
    const interval = setInterval(async () => {
      if (session) {
        await update();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [session, update]);

  return { session, status, update };
}

export function useAuthRedirect() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  return status;
}