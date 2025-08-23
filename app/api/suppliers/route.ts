import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SuppliersData } from "@/app/types/supplier";

export async function GET(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized: No access token provided" }, { status: 401 });
    }

    const url = `${API_BASE_URL}/materials/all-suppliers/`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Invalid response from server: Expected JSON, got ${contentType}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || `Failed to fetch suppliers: ${response.status}` },
        { status: response.status }
      );
    }

    // Format the data to match SuppliersData
    const formattedData: SuppliersData = {
      suppliers: data.suppliers.map((supplier: any) => ({
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
      })),
      regions: data.regions.map((region: any) => ({
        id: region.id,
        name: region.name,
        note: region.note || "",
        created_at: region.created_at,
        updated_at: region.updated_at,
      })),
      categories: data.categories.map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description || "",
        created_at: category.created_at,
        updated_at: category.updated_at,
      })),
      materials: data.materials.map((material: any) => ({
        id: material.id,
        name: material.name,
        category: material.category,
        specification: material.specification,
        unit: material.unit,
        created_at: material.created_at,
        updated_at: material.updated_at,
      })),
      next: data.next || null,
      previous: data.previous || null,
      count: data.count || data.suppliers.length,
    };

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("Error fetching suppliers:", error.message);
    return NextResponse.json(
      {
        error: "Internal server error",
        suppliers: [],
        regions: [],
        categories: [],
        materials: [],
        next: null,
        previous: null,
        count: 0,
      },
      { status: 500 }
    );
  }
}