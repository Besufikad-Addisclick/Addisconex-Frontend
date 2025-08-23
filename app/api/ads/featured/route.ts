import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;
  

  try {
    const url = `${API_BASE_URL}/featured-ads-news/`;
    console.log(`[FetchFeaturedAds] Fetching from backend: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
       
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error(`[FetchFeaturedAds] Non-JSON response (status ${response.status}): ${text.slice(0, 200)}...`);
      return NextResponse.json(
        {
          message: `Invalid response from server: Expected JSON, got ${contentType}`,
          details: text.slice(0, 200),
        },
        { status: response.status || 500 }
      );
    }

    const responseData = await response.json();
    // console.log("[FetchFeaturedAds] Backend response:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error("[FetchFeaturedAds] API error response:", responseData);
      return NextResponse.json(
        { message: responseData.error || `Failed to fetch featured ads: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("[FetchFeaturedAds] Fetch featured ads succeeded");
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("[FetchFeaturedAds] Fetch featured ads failed:", error.message);
    return NextResponse.json(
      { message: `Internal server error: Unable to fetch featured ads: ${error.message}` },
      { status: 500 }
    );
  }
}
