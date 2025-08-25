import { getServerSession } from 'next-auth/next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

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
          const loginUrl = credentials.email
            ? `${apiUrl}/auth/login/`
            : `${apiUrl}/auth/phone-login/`;

          const body = credentials.email
            ? { email: credentials.email, password: credentials.password }
            : { phone_number: credentials.phone_number, password: credentials.password };

          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Login error:', errorData);
            throw new Error(errorData.detail || errorData.message || 'Invalid credentials');
          }

          const data = await response.json();

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
            isActive: data.user.is_active,
            accessToken: data.access,
            refreshToken: data.refresh,
          };
        } catch (error: any) {
          console.error('Authentication error:', error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.userType = user.userType;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phoneNumber = user.phoneNumber;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.user.userType = token.userType as string;
      session.user.firstName = token.firstName as string;
      session.user.lastName = token.lastName as string;
      session.user.phoneNumber = token.phoneNumber as string;
      session.user.isActive = token.isActive as boolean;
      session.user.id = token.sub as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signOut() {
      // Clear any additional client-side storage if needed
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
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

export const auth = {
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      console.log('Fetching subscription plans...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription-plans/`, {
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