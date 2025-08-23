import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    // console.error("[UpdateMaterialPrices] No access token found in cookies");
    return NextResponse.json({ message: "Unauthorized: No access token provided" }, { status: 401 });
  }

  try {
    const data = await request.json();
    // console.log("[UpdateMaterialPrices] Sending payload:", JSON.stringify(data, null, 2));

    const url = `${API_BASE_URL}/materials/material-prices/update/`;
    // console.log(`[UpdateMaterialPrices] Fetching from backend: ${url}`);

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
      // console.error(`[UpdateMaterialPrices] Non-JSON response received: ${text.slice(0, 100)}...`);
      return NextResponse.json(
        { message: `Invalid response from server: Expected JSON, got ${contentType}` },
        { status: 500 }
      );
    }

    const responseData = await response.json();
    // console.log("[UpdateMaterialPrices] Backend response:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      // console.error("[UpdateMaterialPrices] API error response:", responseData);
      return NextResponse.json(
        { message: responseData.error || `Failed to update material prices: ${response.status}` },
        { status: response.status }
      );
    }

    // console.log("[UpdateMaterialPrices] Update material prices succeeded");
    return NextResponse.json({ message: "Material prices updated successfully" });
  } catch (error: any) {
    // console.error("[UpdateMaterialPrices] Update material prices failed:", error.message);
    return NextResponse.json({ message: "Internal server error: Unable to update material prices" }, { status: 500 });
  }
}
