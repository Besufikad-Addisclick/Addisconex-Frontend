import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; 
import { SupplierMachineryPricesData } from "@/app/types/supplier";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const { id } = await params; // Await params to resolve id
  console.log(`[SupplierMachineryPrices API] Received request for supplier ID: ${id}`);

  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    console.error("[SupplierMachineryPrices API] No access token found in cookies");
    return NextResponse.json({ error: "Unauthorized: No access token provided" }, { status: 401 });
  }

  try {
    const url = `${API_BASE_URL}/machineries/prices/supplier/${id}/`;
    console.log(`[SupplierMachineryPrices API] Fetching from backend: ${url}`);

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
      console.error(`[SupplierMachineryPrices API] Non-JSON response received: ${text.slice(0, 100)}...`);
      return NextResponse.json(
        { error: `Invalid response from server: Expected JSON, got ${contentType}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log(`[SupplierMachineryPrices API] Raw backend response for supplier ${id}:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error(`[SupplierMachineryPrices API] Backend error for supplier ${id}: ${response.status} - ${data.error || "Unknown error"}`);
      return NextResponse.json(
        { error: data.error || `Failed to fetch supplier machinery prices: ${response.status}` },
        { status: response.status }
      );
    }

    // Format the data to match SupplierMachineryPricesData
    const formattedData: SupplierMachineryPricesData = {
      machinery_prices: (data.machinery_prices || []).map((price: any) => {
        console.log(`[SupplierMachineryPrices API] Mapping machinery price: ${price.id}`);
        return {
          id: price.id,
          machinery: {
            id: price.machinery.id,
            name: price.machinery.name,
            category: price.machinery.category,
            imageUrl: price.machinery.imageUrl || null,
            uploadedAt: price.machinery.uploadedAt,
          },
          user: {
            id: price.user.id,
            email: price.user.email,
            first_name: price.user.first_name,
            last_name: price.user.last_name,
            phone_number: price.user.phone_number,
            user_type: price.user.user_type,
            profile_picture: price.user.profile_picture || null,
            is_active: price.user.is_active ?? true,
            manufacturer: price.user.manufacturer ?? null,
            user_details: price.user.user_details
              ? {
                  company_name: price.user.user_details.company_name || null,
                  company_address: price.user.user_details.company_address || null,
                  website: price.user.user_details.website || null,
                  description: price.user.user_details.description || null,
                  contact_person: price.user.user_details.contact_person || null,
                  region: price.user.user_details.region || null,
                  established_year: price.user.user_details.established_year || null,
                  team_size: price.user.user_details.team_size || null,
                  equipment: price.user.user_details.equipment || null,
                  category: price.user.user_details.category || null,
                }
              : null,
            key_projects: price.user.key_projects || [],
            documents: price.user.documents || [],
            average_rate: price.user.average_rate || null,
          },
          type: price.type,
          condition: price.condition,
          year: price.year,
          location: price.location,
          image_url: price.image_url || null,
          price: price.price,
          featured: price.featured,
          price_date: price.price_date,
          created_at: price.created_at,
          updated_at: price.updated_at,
        };
      }),
      suppliers: (data.suppliers || []).map((supplier: any) => {
        console.log(`[SupplierMachineryPrices API] Mapping supplier: ${supplier.id}`);
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
        console.log(`[SupplierMachineryPrices API] Mapping category: ${category.id}`);
        return {
          id: category.id,
          name: category.name,
          description: category.description || "",
          created_at: category.created_at,
          updated_at: category.updated_at,
          materials: [], // No materials in this context
        };
      }),
      machineries: (data.machineries || []).map((machinery: any) => {
        console.log(`[SupplierMachineryPrices API] Mapping machinery: ${machinery.id}`);
        return {
          id: machinery.id,
          name: machinery.name,
          type: "sale", // Default type, as machinery list doesn't include type
          category: machinery.category || "Unknown", // Fallback if category is missing
          price: "0.00", // Default price, as machinery list doesn't include price
          imageUrl: machinery.imageUrl || null,
          location: "Unknown", // Default, as machinery list doesn't include location
          uploadedAt: machinery.uploadedAt,
          condition: "unknown", // Default, as machinery list doesn't include condition
          year: 0, // Default, as machinery list doesn't include year
          user: {
            name: "",
            phone: "",
            rating: 0,
            user_email: "",
            region_name: "",
            company_address: "",
            contact_person: "",
          }, // Default empty user, as machinery list doesn't include user
          featured: false, // Default, as machinery list doesn't include featured
          specifications: null, // Default, as machinery list doesn't include specifications
        };
      }),
      
    };

    console.log(`[SupplierMachineryPrices API] Successfully fetched machinery prices for supplier ${id}:`, {
      machinery_prices: formattedData.machinery_prices.length,
      suppliers: formattedData.suppliers.length,
      categories: formattedData.categories.length,
      machineries: formattedData.machineries.length,
    });
    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error(`[SupplierMachineryPrices API] Error fetching machinery prices for supplier ${id}:`, error.message);
    return NextResponse.json(
      {
        error: "Internal server error",
        machinery_prices: [],
        suppliers: [],
        categories: [],
        machineries: [],
        materials: [],
        material_prices: [],
      },
      { status: 500 }
    );
  }
}
