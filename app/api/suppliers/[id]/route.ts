import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SupplierMaterialPricesData } from "@/app/types/supplier";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const { id } = await params; // Await params to resolve id
  // console.log(`[Suppliers API] Received request for supplier ID: ${id}`);

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    // console.error("[Suppliers API] No access token found in cookies");
    return NextResponse.json({ error: "Unauthorized: No access token provided" }, { status: 401 });
  }

  try {
    const url = `${API_BASE_URL}/materials/material-prices/supplier/${id}/`;
    // console.log(`[Suppliers API] Fetching from backend: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      // console.error(`[Suppliers API] Non-JSON response received: ${text.slice(0, 100)}...`);
      return NextResponse.json(
        { error: `Invalid response from server: Expected JSON, got ${contentType}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    // console.log(`[Suppliers API] Raw backend response for supplier ${id}:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      // console.error(`[Suppliers API] Backend error for supplier ${id}: ${response.status} - ${data.error || "Unknown error"}`);
      return NextResponse.json(
        { error: data.error || `Failed to fetch supplier material prices: ${response.status}` },
        { status: response.status }
      );
    }

    // Format the data to match SupplierMaterialPricesData
    const formattedData: SupplierMaterialPricesData = {
      material_prices: (data.material_prices || []).map((price: any) => {
        // console.log(`[Suppliers API] Mapping material price: ${price.id}`);
        return {
          id: price.id,
          material: {
            id: price.material, // UUID string
            name: price.name,
            category: price.category || "Unknown", // Fallback if category is missing
            specification: price.specification,
            unit: price.unit,
          },
          user: price.user || null,
          price: parseFloat(price.price) || 0, // Convert to number
          price_date: price.price_date,
          created_at: price.created_at,
          updated_at: price.updated_at,
          user_id: price.user_id || null,
          name: price.name, // For frontend compatibility
          specification: price.specification,
          unit: price.unit,
        };
      }),
      suppliers: (data.suppliers || []).map((supplier: any) => {
        // console.log(`[Suppliers API] Mapping supplier: ${supplier.id}`);
        return {
          id: supplier.id,
          email: supplier.email,
          first_name: supplier.first_name,
          last_name: supplier.last_name,
          phone_number: supplier.phone_number,
          user_type: supplier.user_type,
          profile_picture: supplier.profile_picture || null,
          is_active: supplier.is_active ?? true,
          manufacturer: supplier.manufacturer ?? null,
          user_details: supplier.user_details
            ? {
                company_name: supplier.user_details.company_name || null,
                company_address: supplier.user_details.company_address || null,
                website: supplier.user_details.website || null,
                description: supplier.user_details.description || null,
                contact_person: supplier.user_details.contact_person || null,
                region: supplier.user_details.region || null,
                established_year: supplier.user_details.established_year || null,
                team_size: supplier.user_details.team_size || null,
                equipment: supplier.user_details.equipment || null,
                category: supplier.user_details.category || null,
              }
            : null,
          key_projects: supplier.key_projects || [],
          documents: supplier.documents || [],
          average_rate: supplier.average_rate || null,
        };
      }),
      categories: (data.categories || []).map((category: any) => {
        // console.log(`[Suppliers API] Mapping category: ${category.id}`);
        return {
          id: category.id,
          name: category.name,
          description: category.description || "",
          created_at: category.created_at,
          updated_at: category.updated_at,
        };
      }),
      materials: (data.materials || []).map((material: any) => {
        // console.log(`[Suppliers API] Mapping material: ${material.id}`);
        return {
          id: material.id,
          name: material.name,
          category: material.category,
          specification: material.specification,
          unit: material.unit,
          created_at: material.created_at,
          updated_at: material.updated_at,
        };
      }),
    };

    // console.log(`[Suppliers API] Successfully fetched material prices for supplier ${id}:`, formattedData.material_prices.length, "prices");
    return NextResponse.json(formattedData);
  } catch (error: any) {
    // console.error(`[Suppliers API] Error fetching material prices for supplier ${id}:`, error.message);
    return NextResponse.json(
      {
        error: "Internal server error",
        material_prices: [],
        suppliers: [],
        categories: [],
        materials: [],
      },
      { status: 500 }
    );
  }
}
