import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "10";
    const category = searchParams.get("category") || "";
    const author = searchParams.get("author") || "";
    const search = searchParams.get("search") || "";

    // Build the URL with query parameters
    const queryParams = new URLSearchParams({
      page,
      page_size: pageSize,
      ...(category && { category }),
      ...(author && { author }),
      ...(search && { search }),
    });
    const url = `${API_BASE_URL}/news-articles-paginated/?${queryParams.toString()}`;
    console.log(`[FetchNewsArticles] Fetching from backend: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error(`[FetchNewsArticles] Non-JSON response (status ${response.status}): ${text.slice(0, 200)}...`);
      return NextResponse.json(
        {
          message: `Invalid response from server: Expected JSON, got ${contentType}`,
          details: text.slice(0, 200),
        },
        { status: response.status || 500 }
      );
    }

    const responseData = await response.json();
    console.log("[FetchNewsArticles] Backend response:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error("[FetchNewsArticles] API error response:", responseData);
      return NextResponse.json(
        { message: responseData.error || `Failed to fetch news articles: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("[FetchNewsArticles] Fetch news articles succeeded");
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("[FetchNewsArticles] Fetch news articles failed:", error.message);
    return NextResponse.json(
      { message: `Internal server error: Unable to fetch news articles: ${error.message}` },
      { status: 500 }
    );
  }
}
