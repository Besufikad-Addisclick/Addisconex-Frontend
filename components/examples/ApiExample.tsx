'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/utils/apiClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
}

export const ApiExample = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/profile/', {
        showErrorToast: true,
        retryOnAuthError: true,
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        toast({
          title: "Success",
          description: "User profile loaded successfully",
        });
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async () => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const updateData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
      };

      const response = await apiClient.put('/profile/', updateData, {
        showErrorToast: true,
        retryOnAuthError: true,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchUserProfile();
    }
  }, [session?.accessToken]);

  if (!session) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Please log in to view this content</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">API Example with Token Refresh</h2>
      
      {loading && (
        <div className="flex items-center space-x-2 mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {userData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={userData.first_name}
                onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={userData.last_name}
                onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">User Type</label>
            <input
              type="text"
              value={userData.user_type}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      )}

      <div className="flex space-x-3 mt-6">
        <Button
          onClick={fetchUserProfile}
          disabled={loading}
          variant="outline"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh Data
        </Button>
        
        <Button
          onClick={updateUserProfile}
          disabled={loading || !userData}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Update Profile
        </Button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Features Demonstrated:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Automatic token refresh on 401 errors</li>
          <li>• User-friendly error messages with toast notifications</li>
          <li>• Loading states during API calls</li>
          <li>• Session management with automatic logout on token expiration</li>
          <li>• Protected route with authentication checks</li>
        </ul>
      </div>
    </div>
  );
};
