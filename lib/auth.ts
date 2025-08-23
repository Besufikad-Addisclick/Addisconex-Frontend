// lib/auth.ts - Keep existing auth utilities for backward compatibility
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getServerAuthSession() {
  return await getServerSession(authOptions)
}

// Keep existing interfaces for backward compatibility
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

// Legacy auth object for backward compatibility
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
      console.log("Subscription plans fetched successfully:", subscriptionPlans);
      return subscriptionPlans;
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error.message);
      throw new Error(error.message || 'Failed to fetch subscription plans');
    }
  },
};