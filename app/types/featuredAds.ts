// types/featuredAds.ts
export interface FeaturedAd {
  id: string;
  type: string;
  title: string;
  company_name: string;
  description: string;
  image: string;
  link_url: string;
  sponsor_name: string;
  display_location: string;
  priority: number;
  content: string;
  event_name: string | null;
  event_date: string | null;
  time_out: number;
  status: string;
  start_date: string;
  end_date: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  image: string;
  author: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    user_type: string;
    profile_picture: string | null;
    is_active: boolean;
    manufacturer: any | null;
    user_details: any | null;
    key_projects: any[];
    documents: any[];
    average_rate: any | null;
    labor_categories: any[];
  };
  date: string;
  category: string;
  read_time: string;
}

export interface FeaturedAdsResponse {
  featured_ads: FeaturedAd[];
  latest_news: News[];
}
