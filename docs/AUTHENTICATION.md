# Authentication System Documentation

This document describes the enhanced authentication system that includes automatic token refresh, error handling, session management, and loading states.

## Overview

The authentication system is built on NextAuth.js with custom enhancements for:
- **Automatic token refresh** when access tokens expire
- **User-friendly error handling** with toast notifications
- **Session management** with automatic logout on token expiration
- **Loading states** and smart redirects
- **Route protection** with role-based access control

## Key Components

### 1. Enhanced NextAuth Configuration (`lib/auth.ts`)

The NextAuth configuration includes:
- **Token refresh logic** in the JWT callback
- **Session error handling** for expired tokens
- **Automatic token rotation** using refresh tokens

```typescript
// Token refresh function
async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${apiUrl}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.access;
  }
  throw new Error('Failed to refresh token');
}
```

### 2. Custom Authentication Hook (`hooks/useAuth.ts`)

Provides a unified interface for authentication state management:

```typescript
const { session, status, isLoading, error, logout, requireAuth } = useAuth();
```

**Features:**
- Automatic session error detection
- Loading states
- Logout functionality
- Route protection helpers

### 3. Protected Route Component (`components/auth/ProtectedRoute.tsx`)

Wraps pages that require authentication:

```typescript
<ProtectedRoute requiredUserType="contractor">
  <YourComponent />
</ProtectedRoute>
```

**Features:**
- Automatic redirect to login for unauthenticated users
- Role-based access control
- Loading states during authentication checks
- Smart redirects based on user type

### 4. Enhanced API Client (`utils/apiClient.ts`)

Provides automatic token refresh and error handling:

```typescript
const response = await apiClient.get('/profile/', {
  showErrorToast: true,
  retryOnAuthError: true,
});
```

**Features:**
- Automatic token refresh on 401 errors
- Retry failed requests with new tokens
- User-friendly error messages
- Configurable error handling

## Usage Examples

### Basic Authentication Check

```typescript
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { session, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {session.user.name}!</div>;
};
```

### Protected Route with Role-Based Access

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const ContractorDashboard = () => {
  return (
    <ProtectedRoute requiredUserType="contractor">
      <div>Contractor Dashboard</div>
    </ProtectedRoute>
  );
};
```

### API Calls with Automatic Token Refresh

```typescript
import { apiClient } from '@/utils/apiClient';

const fetchData = async () => {
  try {
    const response = await apiClient.get('/api/data/', {
      showErrorToast: true,
      retryOnAuthError: true,
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('API call failed:', error);
  }
};
```

### Manual Logout

```typescript
import { useAuth } from '@/hooks/useAuth';

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // User will be redirected to login page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};
```

## Configuration

### Environment Variables

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### Backend Token Configuration

The system expects your backend to support:
- Access tokens with 60-minute lifetime
- Refresh tokens with 7-day lifetime
- Token rotation and blacklisting
- `/auth/token/refresh/` endpoint

```python
# Django settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': env('SECRET_KEY'),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}
```

## Error Handling

### Session Expiration

When a refresh token expires or becomes invalid:
1. User receives a toast notification
2. Session is automatically cleared
3. User is redirected to login page

### API Errors

API errors are handled with:
- User-friendly error messages
- Automatic retry with token refresh
- Toast notifications for user feedback

## Security Features

1. **Token Rotation**: Refresh tokens are rotated on each use
2. **Automatic Logout**: Users are logged out when tokens expire
3. **Route Protection**: Unauthenticated users cannot access protected routes
4. **Role-Based Access**: Users can only access routes appropriate for their role
5. **Secure Storage**: Tokens are stored in HTTP-only cookies

## Migration Guide

### From Old Authentication System

1. **Replace `useSession` with `useAuth`**:
   ```typescript
   // Old
   const { data: session } = useSession();
   
   // New
   const { session, isLoading } = useAuth();
   ```

2. **Wrap protected pages with `ProtectedRoute`**:
   ```typescript
   // Old
   export default function Page() {
     return <div>Content</div>;
   }
   
   // New
   export default function Page() {
     return (
       <ProtectedRoute>
         <div>Content</div>
       </ProtectedRoute>
     );
   }
   ```

3. **Update API calls to use `apiClient`**:
   ```typescript
   // Old
   const response = await fetch('/api/data', {
     headers: { Authorization: `Bearer ${token}` }
   });
   
   // New
   const response = await apiClient.get('/api/data/');
   ```

## Troubleshooting

### Common Issues

1. **Token refresh not working**: Ensure your backend `/auth/token/refresh/` endpoint is working correctly
2. **Session not persisting**: Check that `NEXTAUTH_SECRET` is set correctly
3. **Redirect loops**: Verify that your login page is not wrapped in `ProtectedRoute`

### Debug Mode

Enable debug mode in development:
```typescript
// lib/auth.ts
debug: process.env.NODE_ENV === 'development',
```

This will log authentication events to the console for debugging.

## Best Practices

1. **Always use `ProtectedRoute`** for pages that require authentication
2. **Use `useAuth` hook** instead of `useSession` for consistent behavior
3. **Handle loading states** in your components
4. **Use `apiClient`** for all API calls to benefit from automatic token refresh
5. **Test token expiration scenarios** to ensure proper logout behavior
