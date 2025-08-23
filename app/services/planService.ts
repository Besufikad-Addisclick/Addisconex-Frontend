
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface Package {
  id: string;
  name: string;
  price: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  max_users: number;
  support_level: string;
  has_free_trial: boolean;
  features: string[];
  subscription_plan: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  packages: Package[];
}

interface SubscriptionPlanResponse {
  has_active_subscription: boolean;
  subscription_plans: SubscriptionPlan[];
}

export const fetchSubscriptionPlans = async (): Promise<SubscriptionPlanResponse> => {
  try {
    const url = `${API_URL}/user-subscription-plans/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscription plans: ${response.status}`);
    }

    const data = await response.json();
    return data as SubscriptionPlanResponse;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};