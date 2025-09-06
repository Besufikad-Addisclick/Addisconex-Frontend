import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; 

export async function POST(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    console.error("[AddNewMaterial] No access token found in cookies");
    return NextResponse.json({ message: "Unauthorized: No access token provided" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("[AddNewMaterial] Sending payload:", JSON.stringify(data, null, 2));

    // Validate payload
    if (!data.user_id || !data.category || !data.material || !data.price) {
      console.error("[AddNewMaterial] Invalid payload:", data);
      return NextResponse.json({ message: "Invalid payload: Missing required fields" }, { status: 400 });
    }

    const url = `${API_BASE_URL}/materials/add-material/`;
    console.log(`[AddNewMaterial] Fetching from backend: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.log(`[AddNewMaterial] Non-JSON response received: ${text.slice(0, 100)}...`);
      return NextResponse.json(
        { message: `Invalid response from server: Expected JSON, got ${contentType}` },
        { status: 500 }
      );
    }

    const responseData = await response.json();
    console.log("[AddNewMaterial] Backend response:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.log("[AddNewMaterial] API error response:", responseData);
      return NextResponse.json(
        { message: responseData.error || `Failed to add material: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("[AddNewMaterial] Add material succeeded");
    return NextResponse.json({ message: "New material added successfully" });
  } catch (error: any) {
    console.log("[AddNewMaterial] Add material failed:", error.message);
    return NextResponse.json({ message: "Internal server error: Unable to add material" }, { status: 500 });
  }
}