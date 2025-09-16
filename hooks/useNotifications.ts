import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'reminder' | 'sale' | 'system' | 'update' | 'alert';
  priority: 'low' | 'normal' | 'high';
  created_at: string;
  is_read: boolean;
  read_at: string | null;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  count: number;
  error?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchNotifications = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/notifications/', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NotificationsResponse = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      } else {
        setError(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`/api/auth/notifications/${notificationId}/mark-read/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the notification in the local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true, read_at: new Date().toISOString() }
              : notification
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [session?.accessToken]);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(notification => !notification.is_read).length;
  }, [notifications]);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'normal':
        return 'bg-orange-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }, []);

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'task':
        return '📋';
      case 'reminder':
        return '⏰';
      case 'sale':
        return '💰';
      case 'system':
        return '⚙️';
      case 'update':
        return '🔄';
      case 'alert':
        return '🚨';
      default:
        return '📢';
    }
  }, []);

  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }, []);

  // Fetch notifications on mount and when session changes
  useEffect(() => {
    if (session?.accessToken) {
      fetchNotifications();
    }
  }, [session?.accessToken, fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    getUnreadCount,
    getPriorityColor,
    getTypeIcon,
    formatTimeAgo,
  };
};
