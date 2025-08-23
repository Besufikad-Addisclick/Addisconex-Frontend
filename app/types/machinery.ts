export interface Supplier {
  id?: string;
  name: string;
  phone: string;
  company_address: string;
  contact_person: string;
  region_name: string;
  rating: number;
  user_email?: string;
}

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
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Machinery {
  id: string;
  name: string;
  type: "sale" | "rent";
  category: string;
  price: string;
  imageUrl: string;
  location: string;
  rental_duration?: string;
  uploadedAt: string;
  condition: "new" | "used" | "slightly used";
  year: number;
  supplier: Supplier;
  featured: boolean;
  specifications: { [key: string]: string | null | undefined } | null;
}

export interface MachineriesData {
  suppliers: Machinery[];
  featured: Machinery[];
  regions: Region[];
  categories: Category[];
  next: string | null;
  previous: string | null;
  count: number | null;
}