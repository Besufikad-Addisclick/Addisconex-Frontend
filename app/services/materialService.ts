// app/services/materialService.ts
import { MaterialDetailResponse,SupplierDetailResponse } from './../types/material';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface FilterParams {
  searchQuery?: string;
  selectedRegion?: string;
  selectedPriceType?: string;
  minPrice?: string;
  maxPrice?: string;
  sort_by?: string;
}

export const fetchMaterialDetail = async (
  materialId: string,
  filters: FilterParams = {}
): Promise<MaterialDetailResponse> => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.searchQuery) queryParams.append('search', filters.searchQuery);
    if (filters.selectedRegion && filters.selectedRegion !== 'all') {
      queryParams.append('region', filters.selectedRegion);
    }
    if (filters.selectedPriceType && filters.selectedPriceType !== 'all') {
      queryParams.append('suppliersType', filters.selectedPriceType);
    }
    if (filters.minPrice) queryParams.append('min_price', filters.minPrice);
    if (filters.maxPrice) queryParams.append('max_price', filters.maxPrice);
    
    if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
    console.log("fetchMaterialDetail filters",filters);

    const url = `${API_URL}/materials/${materialId}/?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch material detail: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching material detail:', error);
    throw error;
  }
};
export const fetchSupplierDetail = async (supplierId: string, page: number = 1): Promise<SupplierDetailResponse> => {
  try {
    const url = `${API_URL}/materials/suppliers/${supplierId}/?page=${page}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch supplier detail: ${response.status}`);
    }

    const data = await response.json();
    console.log("fetchSupplierDetail",data)
    return data;
  } catch (error) {
    console.error('Error fetching supplier detail:', error);
    throw error;
  }
};

