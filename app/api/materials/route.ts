import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Region {
  id: string;
  name: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface Materials {
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

interface CategoryMaterialsResponse {
  categories: Category[];
  regions: Region[];
  materials: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Materials[];
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function fetchCategoryMaterials(filters: any, accessToken: string): Promise<CategoryMaterialsResponse> {
  try {
    // Extract category name from searchQuery or default to 'Cement & Concrete'
    const categoryName = filters.searchQuery || 'Concrete Work';

    const params = new URLSearchParams();
    if (categoryName) params.append('search', categoryName); // Use category name in search
    if (filters.selectedRegion && filters.selectedRegion !== 'all') {
      params.append('region', filters.selectedRegion);
    }
    if (filters.page) params.append('page', filters.page);
    params.append('categoryName', categoryName);
    if (filters.page_size) params.append('page_size', filters.page_size);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);

    const url = `${API_URL}/materials/category-materials/?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      categories: data.categories || [],
      regions: data.regions || [],
      materials: {
        count: data.materials.count || 0,
        next: data.materials.next || null,
        previous: data.materials.previous || null,
        results: (data.materials.results || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          specification: item.specification,
          unit: item.unit,
          region: item.region || 'Unknown',
          market: {
            minPrice: item.market.minPrice || 0,
            maxPrice: item.market.maxPrice || 0,
            avgPrice: item.market.avgPrice || 0,
            change: item.market.change || 0,
          },
          manufactured: {
            minPrice: item.manufactured.minPrice || 0,
            maxPrice: item.manufactured.maxPrice || 0,
            avgPrice: item.manufactured.avgPrice || 0,
            change: item.manufactured.change || 0,
          },
        })),
      },
    };
  } catch (error: any) {
    console.error(`[fetchCategoryMaterials] Failed:`, error);
    return {
      categories: [],
      regions: [],
      materials: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
    };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filters = {
    searchQuery: searchParams.get('searchQuery') || 'Concrete Work',
    selectedRegion: searchParams.get('selectedRegion') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: searchParams.get('page') || '1',
    page_size: searchParams.get('page_size') || '5',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        {
          error: 'Unauthorized: Please log in.',
          categories: [],
          regions: [],
          materials: { count: 0, next: null, previous: null, results: [] },
        },
        { status: 401 }
      );
    }

    const data = await fetchCategoryMaterials(filters, session.accessToken);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[api/materials] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch materials data',
        categories: [],
        regions: [],
        materials: { count: 0, next: null, previous: null, results: [] },
      },
      { status: 500 }
    );
  }
}