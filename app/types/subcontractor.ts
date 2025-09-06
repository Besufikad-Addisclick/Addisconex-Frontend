
export interface Region {
  id: number;
  name: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface KeyProject {
  id: string;
  name: string;
  location: string;
  year: number;
  value: string;
  description: string;
  image?: string | null;
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
export interface LaborCategory {
  category_id: string;      // UUID string
  category_name: string;
  team_size: number;
}

export interface UserDetails {
  company_name: string;
  company_address: string;
  website: string;
  description: string | null;
  contact_person: string;
  region?: number | Region;
  regions?: Region;
  established_year: number;
  team_size: number;
  equipment: Array<{ name: string; quantity: string }>;
  year_of_experience: number | null;
  grade: string;
  category: Category;
  [key: string]: any; // For any additional properties that might exist
}

export interface Subcontractor {
  id: string;
  name: string;
  description: string;
  category: string;
  companyAddress: string | null;
  region: string;
  address: string;
  rating: number | null;
  completedProjects: number;
  yearsOfExperience: number;
  phone: string;
  email: string;
  website: string;
  specialization: string[];
  certifications: Document[];
  keyProjects: KeyProject[];
  labor_categories?: LaborCategory[];
  equipment: string[];
  teamSize: number;
  profile_picture: string;
  user_type: string;
  is_active: boolean;
  manufacturer: boolean;
  contact_person: string;
  documents: Document[];
  imageUrl: string | null;
  user_details: UserDetails;
  first_name?: string;
  last_name?: string;
}



export interface SubcontractorsData {
  subcontractors: Subcontractor[];
  categories: Category[];
  regions: Region[];
  next: string | null;
  previous: string | null;
  count: number;
}
