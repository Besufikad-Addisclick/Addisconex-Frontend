export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: string;
  is_active: boolean;
  manufacturer: boolean;
  user_details: {
    company_name: string;
    company_address: string;
    website: string;
    description: string;
    contact_person: string;
    region: number;
    established_year: number | null;
    team_size: number;
    equipment: Equipment[];
  };
  key_projects: KeyProject[];
  documents: Document[];
  regions: Region[];
}

export interface Equipment {
  id?: string;
  name: string;
  quantity: number;
}

export interface KeyProject {
  id: string;
  name: string;
  location: string;
  year: number;
  value: string;
  description: string;
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

export interface Region {
  id: number;
  name: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}