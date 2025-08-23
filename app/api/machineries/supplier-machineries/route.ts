import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SupplierMachineryData } from "@/app/types/supplier";

export async function GET(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    console.error("[SupplierMachineries] No access token found in cookies");
    return NextResponse.json({ error: "Unauthorized: No access token provided" }, { status: 401 });
  }

  try {
    const url = `${API_BASE_URL}/supplier-machineries/`;
    console.log(`[SupplierMachineries] Fetching from backend: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error(`[SupplierMachineries] Non-JSON response received: ${text.slice(0, 100)}...`);
      return NextResponse.json(
        { error: `Invalid response from server: Expected JSON, got ${contentType}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      console.error(`[SupplierMachineries] Backend error: ${response.status} - ${data.error || "Unknown error"}`);
      return NextResponse.json(
        { error: data.error || `Failed to fetch supplier machineries: ${response.status}` },
        { status: response.status }
      );
    }

    // Format the data to match SupplierMachineryPricesData
    const formattedData: SupplierMachineryData = {
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
        materials: [], // No materials in this context
      })),
      machineries: data.machineries.map((machinery: any) => ({
        id: machinery.id,
        name: machinery.name,
        // type: machinery.type,
        category: machinery.category,
        // price: machinery.price,
        imageUrl: machinery.imageUrl || null,
        // location: machinery.location,
        // uploadedAt: machinery.uploadedAt,
        // condition: machinery.condition,
        // year: machinery.year,
        // user: {
        //   name: machinery.user.name,
        //   phone: machinery.user.phone,
        //   rating: machinery.user.rating || 0,
        //   user_email: machinery.user.user_email,
        //   region_name: machinery.user.region_name,
        //   company_address: machinery.user.company_address,
        //   contact_person: machinery.user.contact_person,
        // },
        // featured: machinery.featured,
        // specifications: machinery.specifications || null,
      })),
      next: data.next || null,
      previous: data.previous || null,
      count: data.count || data.suppliers.length,
     
      
    };

    console.log("[SupplierMachineries] Successfully fetched data:", {
      suppliers: formattedData.suppliers.length,
      machineries: formattedData.machineries.length,
      categories: formattedData.categories.length,
      regions: formattedData.regions.length,
    });
    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.log("[SupplierMachineries] Error fetching supplier machineries:", error.message);
    return NextResponse.json(
      {
        error: "Internal server error",
        suppliers: [],
        regions: [],
        categories: [],
        machineries: [],
        materials: [],
        material_prices: [],
        next: null,
        previous: null,
        count: 0,
      },
      { status: 500 }
    );
  }
}
