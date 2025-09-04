// app/types/material.ts
export interface Region {
  id: number;
  name: string;
}
export interface KeyProject {
  id: string;
  name: string;
  location: string;
  description: string;
  value: string;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  file: string;
  file_type: string;
  issued_by: string;
  issued_date: string;
  expiry_date: string;
  is_active: boolean;
}

export interface SupplierUserDetails {
  company_name: string;
  company_address: string;
  website: string | null;
  description: string | null;
  contact_person: string;
  region: number;
  established_year: number | null;
  team_size: string | null;
  equipment: string | null;
}
export interface Supplier {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: string;
  is_active: boolean;
  manufacturer: boolean;
  user_details: SupplierUserDetails;
  key_projects: KeyProject[];
  documents: Document[];
}

export interface Price {
  id: string;
  material: string;
  material_name: string;
  user: string;
  user_details: {
    id: string;
    user_details: {
      company_name?: string;
      contact_person?: string;
      region: number;
    };
    manufacturer: boolean;
    is_active: boolean;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  price: string;
  price_date: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  name: string;
  specification: string;
  unit: string;
  category: string;
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
  description?: string;
}

export interface PriceHistoryData {
  month: string;
  min: number;
  max: number;
  avg: number;
  change: number;
  changeAmount: number;
}

export interface PricePrediction {
  timeframe: string;
  currentPrice: number;
  predictedPrice: number;
  change: number;
  confidence: number;
}

export interface MaterialDetailResponse {
  material: Material;
  prices: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Price[];
  };
  priceHistoryData: PriceHistoryData[];
  pricePredictions: PricePrediction[];
  regions: Region[]; // Add regions to the response type
}


export interface MaterialPrice {
  id: string;
  material: string;
  material_name: string;
  user: string;
  user_details: Supplier;
  price: string;
  price_date: string;
  created_at: string;
  updated_at: string;
}
export interface MachineryPrice {
  id: string;
  machinery: string;
  user: string;
  user_id: string;
  price: string;
  price_date: string;
  created_at: string;
  updated_at: string;
  name: string;
  category: string;
  condition: string;
  type: string;
  rental_duration: string | null;
  status: string;
  year: number;
  location: string;
  specification: string | null;
  featured: boolean;
  image_url: string | null;
}


export interface SupplierDetailResponse {
  supplier: Supplier;
  material_prices: {
    count: number;
    next: string | null;
    previous: string | null;
    results: MaterialPrice[];
  };
  machinery_prices: {
    count: number;
    next: string | null;
    previous: string | null;
    results: MachineryPrice[];
  };
}
