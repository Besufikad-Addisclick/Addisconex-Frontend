import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSessionError = () => {
      if (session?.error === 'RefreshAccessTokenError') {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        signOut({ callbackUrl: '/auth/login' });
      }
    };

    if (status === 'loading') {
      setIsLoading(true);
    } else if (status === 'authenticated') {
      setIsLoading(false);
      setError(null);
      handleSessionError();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
      setError('Not authenticated');
    }
  }, [session, status, toast]);

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  const requireAuth = (callback?: () => void) => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return false;
    }
    if (callback) callback();
    return true;
  };

  return {
    session,
    status,
    isLoading,
    error,
    logout,
    requireAuth,
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
  };
};
