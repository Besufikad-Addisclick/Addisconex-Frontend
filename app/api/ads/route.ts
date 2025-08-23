import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
 
  const { searchParams } = new URL(request.url);
  const adType = searchParams.get("type");
  const displayLocation = searchParams.get("display_location"); // <-- get display_location param

  

  try {
    // Build query parameters dynamically depending on which ones exist
    const params = new URLSearchParams();
    if (adType) params.append("type", adType);
    if (displayLocation) params.append("display_location", displayLocation);

    const url = `${API_BASE_URL}/type-ads/` + (params.toString() ? `?${params.toString()}` : "");
    console.log(`[FetchAds] Fetching from backend: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error(`[FetchAds] Non-JSON response (status ${response.status}): ${text.slice(0, 200)}...`);
      return NextResponse.json(
        {
          message: `Invalid response from server: Expected JSON, got ${contentType}`,
          details: text.slice(0, 200),
        },
        { status: response.status || 500 }
      );
    }

    const responseData = await response.json();
    // console.log("[FetchAds] Backend response:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error("[FetchAds] API error response:", responseData);
      return NextResponse.json(
        { message: responseData.error || `Failed to fetch ads: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("[FetchAds] Fetch ads succeeded");
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("[FetchAds] Fetch ads failed:", error.message);
    return NextResponse.json(
      { message: `Internal server error: Unable to fetch ads: ${error.message}` },
      { status: 500 }
    );
  }
}
