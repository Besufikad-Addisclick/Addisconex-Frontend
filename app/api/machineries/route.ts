import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MachineriesData } from "@/app/types/machinery";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'No access token found. Please log in again.' }, { status: 401 });
    }

    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();

    // Map frontend query params to backend query params
    if (searchParams.get('search')) queryParams.append('search', searchParams.get('search')!);
    if (searchParams.get('selectedRegion') && searchParams.get('selectedRegion') !== 'all') {
      queryParams.append('selectedRegion', searchParams.get('selectedRegion')!);
    }
    if (searchParams.get('selectedCategories')) {
      queryParams.append('selectedCategories', searchParams.get('selectedCategories')!);
    }
    if (searchParams.get('minPrice')) queryParams.append('minPrice', searchParams.get('minPrice')!);
    if (searchParams.get('maxPrice')) queryParams.append('maxPrice', searchParams.get('maxPrice')!);
    if (searchParams.get('page')) queryParams.append('page', searchParams.get('page')!);
    if (searchParams.get('page_size')) queryParams.append('page_size', searchParams.get('page_size')!);

    // Fetch data from the backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const response = await fetch(`${apiUrl}/machineries/?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch (e) {
        console.error('[machineries] Fetch error:', text);
        return NextResponse.json(
          { error: `Failed to fetch machineries: ${response.statusText}`, status: response.status },
          { status: response.status }
        );
      }
      console.error('[machineries] Error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();

    // Normalize the response to match MachineriesData interface
    const normalizedData: MachineriesData = {
      suppliers: data.results || [],
      featured: data.featured || [],
      regions: data.regions || [],
      categories: data.categories || [],
      next: data.next || null,
      previous: data.previous || null,
      count: data.count || null,
    };

    return NextResponse.json(normalizedData);
  } catch (error: any) {
    console.error('[machineries] Unexpected error:', error.message, error.stack);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}