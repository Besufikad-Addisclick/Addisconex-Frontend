// utils/api.ts
interface Supplier {
  id: string;
  companyName: string;
  region: string;
  contactPerson: string;
  phone: string;
  isApproved: boolean;
  materials: Array<{
    material: any;
    id: string;
    name: string;
    category: string;
    specification: string;
    unit: string;
    price: number;
    price_date: string;
  }>;
}
interface MachinerySupplier {
  id: string;
  name: string;
  phone: string;
  company_address: string;
  contact_person: string;
  region_name: string;
  rating: number;
}
interface Materials {
    id: string;
    name: string;
    category: string;
    specification: string;
    unit: string;
    price: number;
    price_date: string;
  };
  interface MaterialPrice {
  id: string;
  material: string;
  price: string;
  price_date: string;
  name: string;
  specification: string;
  unit: string;
}
interface MaterialStats {
  id: string;
  name: string;
  category: string;
  specification: string;
  unit: string;
  region: string;
  market: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    change: number;
  };
  manufactured: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    change: number;
  };
}
export interface CategoryMaterialsResponse {
  categories: Category[];
  main_categories: Category[];
  regions: Region[];
  materials: {
    count: number;
    next: string | null;
    previous: string | null;
    results: MaterialStats[];
  };
}
interface Region {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  parent?: string;
  subcategories?: Category[];
}
// app/utils/api.tsx
interface SuppliersData {
  suppliers: Supplier[];
  regions: Region[];
  categories: Category[];
  materials: Materials[];
  next: string | null;
  previous: string | null;
  count: Number | null;
}




interface NewMaterial {
  supplier_id: string;
  category: string;
  material: string;
  price: string;
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
interface Subscription {
  id: string;
  user: string;
  package: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface SubscriptionResponse {
  has_active_subscription: boolean;
  subscription: Subscription | null;
}
export interface Package {
  id: string;
  name: string;
  price: string;
  description: string;
  is_active: boolean;
  max_users: number;
  support_level: string;
  has_free_trial: boolean;
  features: string[];
  subscription_plan?: string | SubscriptionPlan;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  packages: Package[];
}

export interface ApiResponse {
  has_active_subscription: boolean;
  package: Package | null;
  active_subscription: UserSubscription | null;
}
interface Material {
  id: string;
  name: string;
  specification: string;
  unit: string;
  category: string;
  region: string | null;
  market: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    change: number;
  };
  manufactured: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    change: number;
  };
  description: string | null;
}

interface UserDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: string;
  is_active: boolean;
  manufacturer: boolean;
}

interface SupplierPrice {
  id: string;
  material: string;
  material_name: string;
  user: string;
  user_details: UserDetails;
  price: string;
  price_date: string;
  created_at: string;
  updated_at: string;
}

interface PriceHistoryData {
  month: string;
  min: number;
  max: number;
  avg: number;
  change: number;
  changeAmount: number;
}

interface PricePrediction {
  timeframe: string;
  currentPrice: number;
  predictedPrice: number;
  change: number;
  confidence: number;
}

interface Machinery {
  id: string;
  name: string;
  type: 'sale' | 'rent';
  category: string;
  price: number;
  imageUrl: string;
  location: string;
  uploadedAt: string;
  condition: 'new' | 'used' | 'slightly used';
  year: number;
  supplier: MachinerySupplier;
  featured: boolean;
  specifications: {
    [key: string]: string | null | undefined;
    operating_weight?: string | null;
    engine_power?: string | null;
    operating_hours?: string | null;
    bucket_capacity?: string | null;
    engine?: string | null;
    power?: string | null;
    transmission?: string | null;
    fuel_capacity?: string | null;
  } | null;
}
interface MachineriesData {
  suppliers: Machinery[]; // Named 'suppliers' to match API response key
  featured: Machinery[];
  regions: Region[];
  categories: Category[];
  next: string | null;
  previous: string | null;
  count: number | null;
}

interface MaterialResponse {
  material: Material | null;
  prices: {
    count: number;
    next: string | null;
    previous: string | null;
    results: SupplierPrice[];
  };
  priceHistoryData: PriceHistoryData[];
  pricePredictions: PricePrediction[];
}

export const fetchWithAuth = async (url: string, options: RequestInit = {}, accessToken: string | null, refreshToken?: string | null): Promise<Response> => {
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
      
      // Try to refresh the token if we have a refresh token
      if (refreshToken) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
          const refreshResponse = await fetch(`${apiUrl}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const newAccessToken = refreshData.access;
            
            // Update the authorization header with the new token
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            
            // Retry the original request with the new token
            const retryResponse = await fetch(url, {
              ...options,
              headers,
            });
            
            if (retryResponse.ok) {
              return retryResponse;
            }
          }
        } catch (refreshError) {
          console.error('[fetchWithAuth] Token refresh failed:', refreshError);
        }
      }
      
      // If refresh failed or no refresh token, throw error to trigger logout
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  } catch (error: any) {
    console.error('[fetchWithAuth] Error:', error.message);
    throw error;
  }
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function fetchSuppliers(token: string, filters: any): Promise<SuppliersData> {
  try {
    // Add page and page_size to filters if present
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(
      `${API_URL}/materials/suppliers-with-materials/?${params}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // If paginated, data.results contains suppliers
    //  console.log("Fetch suppliers succeded:", data);
    return {
  suppliers: data.results ?? data.suppliers ?? [],
  regions: data.regions ?? [],
  categories: data.categories ?? [],
  next: data.next,
  materials: [],
  previous: data.previous,
  count: data.count,
};

  } catch (error) {
    // console.log("Fetch suppliers failed:", error);
    return {
      suppliers: [],
      regions: [],
      categories: [],
      materials: [],
      next: null,
      previous: null,
      count: 0,
    };
  }
}

export async function fetchCategoryMaterials(categoryName: string, filters: any): Promise<CategoryMaterialsResponse> {
  try {
    const params = new URLSearchParams();
    params.append('searchQuery', categoryName); // Use category name in searchQuery
    if (filters.selectedRegion && filters.selectedRegion !== 'all') {
      params.append('selectedRegion', filters.selectedRegion);
    }
    if (filters.page) params.append('page', filters.page);
    if (filters.page_size) params.append('page_size', filters.page_size);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

    const response = await fetch(`/api/materials?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.log(`[fetchCategoryMaterials] Success for category ${categoryName}:`, data);
    return data as CategoryMaterialsResponse;
  } catch (error: any) {
    // console.error(`[fetchCategoryMaterials] Failed for category ${categoryName}:`, error);
    throw error;
  }
}

// export async function fetchSuppliers(filters: any): Promise<SuppliersData> {
//   try {
//     const params = new URLSearchParams(filters).toString();
//     const response = await fetch(`/api/suppliers?${params}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('[fetchSuppliers] Success:', data);
//     return {
//       suppliers: data.results ?? data.suppliers ?? [],
//       regions: data.regions ?? [],
//       categories: data.categories ?? [],
//       materials: [],
//       next: data.next,
//       previous: data.previous,
//       count: data.count,
//     };
//   } catch (error) {
//     console.error('[fetchSuppliers] Failed:', error);
//     return {
//       suppliers: [],
//       regions: [],
//       categories: [],
//       materials: [],
//       next: null,
//       previous: null,
//       count: 0,
//     };
//   }
// }
   
export async function fetchAllSuppliers(token: string): Promise<SuppliersData> {
  try {
    const response = await fetch(
      `${API_URL}/materials/all-suppliers/`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetch all suppliers succeeded:", data);

    // Format the data to match the expected structure
    const formattedData: SuppliersData = {
      suppliers: data.suppliers.map((supplier: any) => ({
        id: supplier.id,
        companyName: supplier.company_name,
        region: supplier.region_name,
        contactPerson: supplier.contact_person,
        phone: supplier.phone,
        isApproved: supplier.is_approved,
        materials: supplier.materials || [], // Assuming materials are included in the supplier data
      })),
      regions: data.regions.map((region: any) => ({
        id: region.id.toString(),
        name: region.name,
      })),
      categories: data.categories.map((category: any) => ({
        id: category.id.toString(),
        name: category.name,
      })),
      materials: data.materials.map((material: any) => ({
        id: material.id,
        name: material.name,
        category: material.category_name,
        specification: material.specification,
        unit: material.unit,
        price: material.current_price,
        price_date: material.created_at, // Assuming created_at is used as price_date
      })),
      next: null,
      previous: null,
      count: 0,
    };

    return formattedData;
  } catch (error) {
    console.error("Fetch suppliers failed:", error);
    return {
      suppliers: [],
      regions: [],
      categories: [],
      materials: [],
      next: null,
      previous: null,
      count: 0,
    };
    
  }
}


export async function fetchMaterialPrices(token: string, supplierId: string): Promise<Materials[]> {
  try {
    const response = await fetch(
      `${API_URL}/materials/material-prices/supplier/${supplierId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // console.log("supplierId", supplierId);
    console.log("Fetch material prices succeeded:", data);
    // const formattedData: MaterialPricesData = {
    //   suppliers: [],
    //   categories: data.categories.map((category: any) => ({
    //     id: category.id.toString(),
    //     name: category.name,
    //     materials:[]
    //   })),
    //   materials: data.materials.map((material: any) => ({
    //     id: material.id,
    //     name: material.name,
    //     category: material.category_name,
    //     specification: material.specification,
    //     unit: material.unit, // Assuming created_at is used as price_date
    //   })),
    //   material_prices: data.material_prices.map((material: any) => ({
    //     id: material.id,
    //     name: material.name,
    //     category: material.category_name,
    //     specification: material.specification,
    //     unit: material.unit,
    //     price: material.current_price,
    //     price_date: material.created_at, // Assuming created_at is used as price_date
    //   })),
    // };

    // return formattedData;
    return data.material_prices ?? [];
  } catch (error) {
    console.error("Fetch material prices failed:", error);
    
    return [];
  }
}


export async function addNewMaterial(token: string, data: NewMaterial): Promise<void> {
  try {
    const response = await fetch(
      `${API_URL}/materials/add-material/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("Add new material succeeded");
  } catch (error) {
    console.error("Add new material failed:", error);
    throw error;
  }
}


export async function checkUserSubscription(token: string): Promise<SubscriptionResponse> {
  try {
    
    const response = await fetch(`${API_URL}/check-subscription/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Check subscription failed:", errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Check subscription succeeded:", data);
    return data;
  } catch (error) {
    console.error("Check subscription failed:", error);
    throw error;
  }
  
}
export async function fetchPackageById(token: string, packageId: string): Promise<ApiResponse> {
  try {
    const url = packageId
      ? `${API_URL}/user-subscription-plan/?package_id=${packageId}`
      : `${API_URL}/user-subscription-plan/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP error ${response.status}` };
      }
      throw new Error(errorData.message || 'Failed to fetch package details');
    }

    const packageData = await response.json();
    console.log("packageData:", packageData);
    return packageData;
  } catch (error: any) {
    console.error('Error fetching package details:', error.message);
    throw new Error(error.message || 'Failed to fetch package details');
  }
}

// export async function uploadInvoice(token: string,packageId: string, subscriptionId: string, file: File): Promise<{ message: string; subscription_id: string }> {
//   try {
//     const formData = new FormData();
//     formData.append('subscription_id', subscriptionId);
//     formData.append('package_id', packageId);
//     formData.append('screenshot', file);

//     const response = await fetch(`${API_URL}/user-subscription/upload-invoice/`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//       body: formData,
//     });

//     if (!response.ok) {
//       let errorData;
//       try {
//         errorData = await response.json();
//       } catch {
//         errorData = { message: `HTTP error ${response.status}` };
//       }
//       throw new Error(errorData.message || 'Failed to upload invoice');
//     }

//     const result = await response.json();
//     return result;
//   } catch (error: any) {
//     console.log('Error uploading invoice:', error.message);
//     throw new Error(error.message || 'Failed to upload invoice');
//   }
// }

export const fetchMachineries = async (token: string, params: any): Promise<MachineriesData> => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.selectedRegion && params.selectedRegion !== 'all') queryParams.append('selectedRegion', params.selectedRegion);
  if (params.selectedCategories) queryParams.append('selectedCategories', params.selectedCategories);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice);
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.page_size) queryParams.append('page_size', params.page_size.toString());

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/machineries/?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      suppliers: data.results || data.suppliers || [],
      featured: data.featured || [],
      regions: data.regions || [],
      categories: data.categories || [],
      next: data.next || null,
      previous: data.previous || null,
      count: data.count || 0,
    };
  } catch (error) {
    console.error('Error fetching machineries:', error);
    throw error;
  }
};

export async function fetchSingleMaterial(materialId: string, page: string = '1', pageSize: string = '5'): Promise<MaterialResponse> {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('page_size', pageSize);

  
    const response = await fetch(`/api/materials/single/${materialId}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      material: data.material
        ? {
            id: data.material.id,
            name: data.material.name,
            specification: data.material.specification,
            unit: data.material.unit,
            category: data.material.category,
            region: data.material.region,
            market: {
              minPrice: data.material.market.minPrice,
              maxPrice: data.material.market.maxPrice,
              avgPrice: data.material.market.avgPrice,
              change: data.material.market.change,
            },
            manufactured: {
              minPrice: data.material.manufactured.minPrice,
              maxPrice: data.material.manufactured.maxPrice,
              avgPrice: data.material.manufactured.avgPrice,
              change: data.material.manufactured.change,
            },
            description: data.material.description,
          }
        : null,
      prices: {
        count: data.prices.count || 0,
        next: data.prices.next || null,
        previous: data.prices.previous || null,
        results: (data.prices.results || []).map((item: any) => ({
          id: item.id,
          material: item.material,
          material_name: item.material_name,
          user: item.user,
          user_details: {
            id: item.user_details.id,
            email: item.user_details.email,
            first_name: item.user_details.first_name,
            last_name: item.user_details.last_name,
            phone_number: item.user_details.phone_number,
            user_type: item.user_details.user_type,
            is_active: item.user_details.is_active,
            manufacturer: item.user_details.manufacturer,
          },
          price: item.price,
          price_date: item.price_date,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })),
      },
      priceHistoryData: (data.priceHistoryData || []).map((item: any) => ({
        month: item.month,
        min: item.min,
        max: item.max,
        avg: item.avg,
        change: item.change,
        changeAmount: item.changeAmount,
      })),
      pricePredictions: (data.pricePredictions || []).map((item: any) => ({
        timeframe: item.timeframe,
        currentPrice: item.currentPrice,
        predictedPrice: item.predictedPrice,
        change: item.change,
        confidence: item.confidence,
      })),
    };
  } catch (error: any) {
    console.log(`[fetchSingleMaterial] Error fetching material ${materialId}:`, error);
    throw error;
  }
}


export const getSubscriptionPlans = async (accessToken: string | null, refreshToken?: string | null): Promise<SubscriptionPlan[]> => {
  const response = await fetchWithAuth('/api/subscription-plans', {
    method: 'GET',
  }, accessToken, refreshToken);

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



