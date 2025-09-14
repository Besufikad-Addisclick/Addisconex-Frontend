import { getServerSession } from 'next-auth/next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Token refresh function
async function refreshAccessToken(refreshToken: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const response = await fetch(`${apiUrl}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        phone_number: { label: 'Phone Number', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
          const email = (credentials.email ?? '').trim();
          const phone = (credentials.phone_number ?? '').trim();
          const password = credentials.password ?? '';

          console.log('NextAuth authorize - email:', email, 'phone:', phone);

          const usePhone = !email && !!phone;

          const loginUrl = usePhone
            ? `${apiUrl}/auth/phone-login/`
            : `${apiUrl}/auth/login/`;

          const body = usePhone
            ? { phone_number: phone, password }
            : { email, password };

          console.log('NextAuth authorize - using URL:', loginUrl);
          console.log('NextAuth authorize - sending body:', JSON.stringify(body));

          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(body),
          });

          console.log('NextAuth authorize - response status:', response.status);

          if (!response.ok) {
            let message = 'Invalid credentials';
            try {
              const errorData = await response.json();
              console.error('NextAuth authorize - Login error response:', errorData);
              message = (
                errorData?.detail ||
                errorData?.message ||
                errorData?.error ||
                (Array.isArray(errorData?.non_field_errors) ? errorData.non_field_errors.join(' ') : null) ||
                // Fallback to join any field validation messages
                (typeof errorData === 'object' && errorData
                  ? Object.entries(errorData)
                      .filter(([, v]) => Array.isArray(v))
                      .map(([k, v]) => `${k}: ${(v as string[]).join(' ')}`)
                      .join(' ')
                  : null) ||
                message
              );
            } catch (parseErr) {
              console.error('NextAuth authorize - Failed to parse login error response:', parseErr);
            }
            console.error('NextAuth authorize - Throwing error:', message);
            throw new Error(message);
          }

          const data = await response.json();
          console.log('NextAuth authorize - data:', data);

          if (!data.user.is_active) {
            throw new Error('User account is inactive');
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: `${data.user.first_name} ${data.user.last_name}`,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            phoneNumber: data.user.phone_number,
            userType: data.user.user_type,
            verificationExpiresAt:data.user.verification_expires_at,
            currentPackageName: data.user.current_package_name,
            isActive: data.user.is_active,
            accessToken: data.access,
            refreshToken: data.refresh,
          };
        } catch (error: any) {
          console.error('Authentication error:', error.message);
          throw new Error(error.message || 'Invalid credentials');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('JWT callback - user:', !!user, 'trigger:', trigger);
      
      // Initial sign in
      if (user) {
        console.log('JWT callback - Setting up new token for user:', user.email);
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.userType = user.userType;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phoneNumber = user.phoneNumber;
        token.currentPackageName = user.currentPackageName;
        token.isActive = user.isActive;
        token.verificationExpiresAt = user.verificationExpiresAt;
        token.accessTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour from now
        token.email = user.email;
        token.name = user.name;
        return token;
      }

      // Handle session update
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token.refreshToken as string)
        .then((accessToken) => {
          return {
            ...token,
            accessToken,
            accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour from now
          };
        })
        .catch((error) => {
          console.error('Error refreshing token:', error);
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        });
    },
    async session({ session, token }) {
      console.log('Session callback - token exists:', !!token);
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.user.userType = token.userType as string;
      session.user.firstName = token.firstName as string;
      session.user.lastName = token.lastName as string;
      session.user.phoneNumber = token.phoneNumber as string;
      session.user.verificationExpiresAt = token.verificationExpiresAt as string;
      session.user.phoneNumber = token.phoneNumber as string;
      session.user.currentPackageName = token.currentPackageName as string;
    session.user.isActive = token.isActive as boolean;
      session.user.id = token.sub as string;
      session.error = token.error as string;
      console.log('Session callback - session user:', session.user.email);
      console.log('Session callback - session user:', session.user.verificationExpiresAt);
      console.log('Session callback - session user:', session.user.currentPackageName);
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If there's a specific URL requested, honor it
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      
      // Default fallback - role-based redirects are handled in the login page
      // This will be overridden by the login page logic for specific user types
      return `${baseUrl}/dashboard`;
    },
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days (matches refresh token lifetime)
  },
  events: {
    async signOut() {
      // Clear any additional client-side storage if needed
    },
  },
  secret: process.env.NEXTAUTH_SECRET as string,
  debug: process.env.NODE_ENV === 'development',
};

// Existing utilities
export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

// Keep existing interfaces
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: 'contractor' | 'supplier' | 'subcontractor' | 'consultant' | 'admin';
  is_active: boolean;
}

export interface Package {
  id: string;
  name: string;
  price: string;
  description: string;
  is_active: boolean;
  max_users: number;
  order: number;
  support_level: string;
  has_free_trial: boolean;
  features: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  packages: Package[];
}

interface UserSubscription {
  id: string;
  user: string;
  package: string;
  start_date: string;
  end_date: string;
  screenshot: string;
  created_at: string;
  status: string;
}

export interface ApiResponse {
  has_active_subscription: boolean;
  subscription_plans: SubscriptionPlan[];
  active_subscription: UserSubscription | null;
}
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
export const auth = {
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      console.log('Fetching subscription plans...');
      const response = await fetch(`${apiUrl}/subscription-plans/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscription plans');
      }

      const subscriptionPlans = await response.json();
      return subscriptionPlans.results;
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error.message);
      throw new Error(error.message || 'Failed to fetch subscription plans');
    }
  },
  async getSubscriptionPlansByUserType(token: string, userType: string): Promise<ApiResponse> {
    try {
      console.log(`Fetching subscription plans for user type: ${userType}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-subscription-plans/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscription plans');
      }

      const subscriptionPlans = await response.json();
      console.log('Subscription plans fetched successfully:', subscriptionPlans);
      return subscriptionPlans;
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error.message);
      throw new Error(error.message || 'Failed to fetch subscription plans');
    }
  },
};