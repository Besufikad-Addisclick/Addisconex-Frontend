
export interface Region {
  id: number;
  name: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  materials: Array<{ id: string; name: string }>;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Material {
  id: string;
  name: string;
  category: number; // References Category.id
  specification: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface KeyProject {
  id: string;
  name: string;
  location: string;
  year: number;
  value: string;
  description: string;
  created_at?: string;
  updated_at?: string;
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

export interface UserDetails {
  company_name: string | null;
  company_address: string | null;
  website: string | null;
  description: string | null;
  contact_person: string | null;
  region: Region | null;
  established_year: number | null;
  team_size: number | null;
  equipment: string[] | null;
  category: Category | null;
}

export interface Machinery {
  id: string;
  name: string;
  type: "sale" | "rent";
  category: string; // e.g., "Cranes", "Trucks", "Excavators"
  price: string;
  imageUrl: string | null;
  image_url: string | null;
  location: string;
  uploadedAt: string;
  condition: string;
  year: number;
  user: {
    name: string;
    phone: string;
    rating: number;
    user_email: string;
    region_name: string;
    company_address: string;
    contact_person: string;
  };
  featured: boolean;
  specifications: string | null;
}

export interface Supplier {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: string;
  profile_picture: string | null;
  is_active: boolean;
  manufacturer: boolean | null;
  user_details: UserDetails | null;
  key_projects: KeyProject[];
  documents: Document[];
  average_rate: number | null;
}

export interface SuppliersData {
  suppliers: Supplier[];
  regions: Region[];
  categories: Category[];
  materials: Material[];
  next: string | null;
  previous: string | null;
  count: number;
}
export interface MaterialPrice {
  id: string;
  material: string; // Material ID
  user: string; // Supplier ID
  price: string; // Decimal as string
  price_date: string;
  created_at: string;
  updated_at: string;
  user_id: string; // Duplicate of user for consistency
  name: string; // Material name
  specification: string; // Material specification
  unit: string; // Material unit
}

export interface SupplierMaterialPricesData {
  material_prices: MaterialPrice[];
  suppliers: Supplier[];
  categories: Category[];
  materials: Material[];
}
export interface MachineryPrice {
  id: string;
  machinery: {
    id: string;
    name: string;
    category: string;
    imageUrl: string | null;
    uploadedAt: string;
  };
  user: Supplier;
  type: "sale" | "rent";
  condition: string;
  year: number;
  rental_duration?: string;
  location: string;
  image_url: string | null;
  price: string;
  featured: boolean;
  price_date: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierMachineryPricesData {
  machinery_prices: MachineryPrice[];
  suppliers: Supplier[];
  categories: Category[];
  machineries: Machinery[];
}
export interface SupplierMachineryData {
  machineries: Machinery[];
  suppliers: Supplier[];
  categories: Category[];
  regions: Region[];
  next: string | null;
  previous: string | null;
  count: number;
}
