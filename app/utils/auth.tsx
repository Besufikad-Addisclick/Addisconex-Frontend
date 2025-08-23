export interface Login {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    user_type: string;
    is_active: boolean;
  };
  refresh: string;
  access: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  message: string;
}

export interface Publication {
  id: number;
  name: string;
  category: string;
  year: number;
  file: string;
}

export interface PublicationResponse {
  results: Publication[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  packages: Package[];
  has_active_subscription?: boolean;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_plan: string;
  max_users: number;
  support_level: string;
  has_free_trial: boolean;
  features: string[] | null;
  type: string;
}

export interface UserSubscription {
  id: string;
  user: string;
  package: string;
  amount: number;
  status: string;
  start_date: string;
  end_date: string;
  payment_method: string;
  payment_id: string | null;
  screenshot: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckSubscriptionResponse {
  has_active_subscription: boolean;
  subscription: UserSubscription | null;
}

export const fetchWithAuth = async (url: string, options: RequestInit = {}, accessToken: string | null): Promise<Response> => {
  try {
    if (!accessToken) {
      console.error('[fetchWithAuth] No access token available');
      throw new Error('No access token found. Please log in again.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${accessToken}`);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });
    

    if (response.status === 401) {
      console.error('[fetchWithAuth] Unauthorized, attempting to refresh token');
      throw new Error('No access token found. Please log in again.');
    }

    return response;
  } catch (error: any) {
    console.error('[fetchWithAuth] Error:', error.message);
    throw error;
  }
};

export const fetchUserProfile = async (accessToken: string): Promise<Login['user']> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  const response = await fetchWithAuth(`${apiUrl}/auth/profile/`, {
    method: 'GET',
  }, accessToken);

  if (!response.ok) {
    const text = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch (e) {
      console.error('Profile fetch error:', text);
      throw new Error(`Failed to fetch user profile: ${response.statusText} (Status: ${response.status})`);
    }
    console.error('Profile error:', errorData);
    throw errorData;
  }

  const data = await response.json();
  // console.log('Profile response:', data);
  return data;
};

// export const login = async (email: string, password: string,phone_number: string, rememberMe: boolean = false): Promise<Login> => {
//   const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ email, password }),
//     credentials: 'include',
//   });

//   if (!response.ok) {
//     const text = await response.text();
//     let errorData;
//     try {
//       errorData = JSON.parse(text);
//     } catch (e) {
//       console.error('Login error: Non-JSON response', text);
//       throw new Error(`Login failed: ${response.statusText} (Status: ${response.status})`);
//     }
//     console.log('Error:', errorData);
//     throw errorData;
//   }

//   const data = await response.json();
//   console.log('Login response:', data);
//   return data;
// };
export const login = async (
  email: string,
  password: string,
  phoneNumber: string,
  rememberMe: boolean = false
): Promise<Login> => {
  // Determine which login endpoint to use based on whether email or phone number is provided
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  const loginUrl = email
    ? `${apiUrl}/auth/login/`
    : `${apiUrl}/auth/phone-login/`;
    

  // Prepare the request body based on the login method
  const body = email
    ? JSON.stringify({ email, password, rememberMe })
    : JSON.stringify({ phone_number: phoneNumber, password, rememberMe });

  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body,
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch (e) {
      console.error('Login error: Non-JSON response', text);
      throw new Error(`Login failed: ${response.statusText} (Status: ${response.status})`);
    }
    console.log('Error:', errorData);
    throw errorData;
  }

  const data = await response.json();
  console.log('Login response:', data);
  return data;
};


export const register = async (
  email: string,
  password: string,
  password2: string,
  first_name: string,
  last_name: string,
  phone_number: string
): Promise<RegisterResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  const response = await fetch(`${apiUrl}/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, password2, first_name, last_name, phone_number }),
  });

  if (!response.ok) {
    const text = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch (e) {
      console.error('Register error:', text);
      throw new Error(`Registration failed: ${response.statusText} (Status: ${response.status})`);
    }
    // console.log('Register error:', errorData);
    throw errorData;
  }

  const data = await response.json();
  console.log('Register response:', data);
  return data;
};



export const getSubscriptionPlans = async (accessToken: string | null): Promise<SubscriptionPlan[]> => {
  const response = await fetchWithAuth('/api/subscription-plans', {
    method: 'GET',
  }, accessToken);

  if (!response.ok) {
    const text = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch (e) {
      console.error('Subscription plans fetch error:', text);
      throw new Error(`Failed to fetch subscription plans: ${response.statusText} (Status: ${response.status})`);
    }
    console.error('Subscription plans error:', errorData);
    throw errorData;
  }

  const data = await response.json();
  console.log('Subscription plans response:', data);
  const plansWithSubscriptionFlag: SubscriptionPlan[] = (data.results || []).map((plan: any) => ({
    ...plan,
    has_active_subscription: data.has_active_subscription,
  }));

  return plansWithSubscriptionFlag;
};



