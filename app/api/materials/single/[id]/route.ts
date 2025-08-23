import { NextRequest, NextResponse } from "next/server"; // Import NextRequest
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

interface Material {
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

interface SupplierPrice {
  id: string;
  supplier: {
    id: string;
    companyName: string;
    region: string;
    contactPerson: string;
    phone: string;
    isApproved: boolean;
  };
  material: {
    id: string;
    name: string;
    category: string;
    specification: string;
    unit: string;
  };
  price: number;
  price_date: string;
}

interface MaterialResponse {
  material: Material | null;
  supplierPrices: {
    count: number;
    next: string | null;
    previous: string | null;
    results: SupplierPrice[];
  };
  categories: Category[];
  regions: Region[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// Define the expected params type as a Promise
type RouteParams = {
  params: Promise<{ id: string }>;
};

async function fetchMaterial(materialId: string, accessToken: string): Promise<Material | null> {
  try {

    const url = `${API_URL}/materials/${materialId}/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      specification: data.specification,
      unit: data.unit,
      region: data.region || "Unknown",
      market: {
        minPrice: data.market.minPrice || 0,
        maxPrice: data.market.maxPrice || 0,
        avgPrice: data.market.avgPrice || 0,
        change: data.market.change || 0,
      },
      manufactured: {
        minPrice: data.manufactured.minPrice || 0,
        maxPrice: data.manufactured.maxPrice || 0,
        avgPrice: data.manufactured.avgPrice || 0,
        change: data.manufactured.change || 0,
      },
    };
  } catch (error: any) {
    console.error(`[fetchMaterial] Failed for material ${materialId}:`, error);
    return null;
  }
}

async function fetchSupplierPrices(
  materialId: string,
  page: string,
  pageSize: string,
  accessToken: string
): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: SupplierPrice[];
}> {
  try {

    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (pageSize) params.append("page_size", pageSize);

    const url = `${API_URL}/materials/${materialId}/suppliers/?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      count: data.count || 0,
      next: data.next || null,
      previous: data.previous || null,
      results: (data.results || []).map((item: any) => ({
        id: item.id,
        supplier: {
          id: item.supplier.id,
          companyName: item.supplier.companyName,
          region: item.supplier.region,
          contactPerson: item.supplier.contactPerson,
          phone: item.supplier.phone,
          isApproved: item.supplier.isApproved,
        },
        material: {
          id: item.material.id,
          name: item.material.name,
          category: item.material.category,
          specification: item.material.specification,
          unit: item.material.unit,
        },
        price: item.price || 0,
        price_date: item.price_date || "",
      })),
    };
  } catch (error: any) {
    console.error(`[fetchSupplierPrices] Failed for material ${materialId}:`, error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
}

async function fetchCategoriesAndRegions(accessToken: string): Promise<{ categories: Category[]; regions: Region[] }> {
  try {

    const [categoriesResponse, regionsResponse] = await Promise.all([
      fetch(`${API_URL}/categories/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }),
      fetch(`${API_URL}/regions/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }),
    ]);

    if (!categoriesResponse.ok || !regionsResponse.ok) {
      throw new Error("Failed to fetch categories or regions");
    }

    const categoriesData = await categoriesResponse.json();
    const regionsData = await regionsResponse.json();

    return {
      categories: (categoriesData.results || categoriesData || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || "",
        created_at: cat.created_at || "",
        updated_at: cat.updated_at || "",
      })),
      regions: (regionsData.results || regionsData || []).map((reg: any) => ({
        id: reg.id,
        name: reg.name,
        note: reg.note || "",
        created_at: reg.created_at || "",
        updated_at: reg.updated_at || "",
      })),
    };
  } catch (error: any) {
    console.error("[fetchCategoriesAndRegions] Failed:", error);
    return { categories: [], regions: [] };
  }
}

export async function GET(req: NextRequest, context: RouteParams) {
  const { id } = await context.params; // Await the params Promise
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("page_size") || "5";

  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        {
          error: "Unauthorized: Please log in.",
          material: null,
          supplierPrices: { count: 0, next: null, previous: null, results: [] },
          categories: [],
          regions: [],
        },
        { status: 401 }
      );
    }

    const [material, supplierPrices, { categories, regions }] = await Promise.all([
      fetchMaterial(id, session.accessToken),
      fetchSupplierPrices(id, page, pageSize, session.accessToken),
      fetchCategoriesAndRegions(session.accessToken),
    ]);

    if (!material) {
      return NextResponse.json(
        {
          error: "Material not found",
          material: null,
          supplierPrices: { count: 0, next: null, previous: null, results: [] },
          categories: [],
          regions: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        material,
        supplierPrices,
        categories,
        regions,
      } as MaterialResponse,
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`[api/materials/${id}] Error:`, error.message);
    return NextResponse.json(
      {
        error: "Failed to fetch material data",
        material: null,
        supplierPrices: { count: 0, next: null, previous: null, results: [] },
        categories: [],
        regions: [],
      },
      { status: 500 }
    );
  }
}