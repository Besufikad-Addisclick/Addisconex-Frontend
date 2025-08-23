import { NextRequest, NextResponse } from "next/server";

// Define the expected params type as a Promise
type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const { id } = await context.params; // Await the params Promise

  try {
    const url = `${API_BASE_URL}/news-article/${id}/`;
    console.log(`[FetchNewsArticleDetail] Fetching from backend: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await response.text();
      console.error(`[FetchNewsArticleDetail] Non-JSON response (status ${response.status}): ${text.slice(0, 200)}...`);
      return NextResponse.json(
        {
          message: `Invalid response from server: Expected JSON, got ${contentType}`,
          details: text.slice(0, 200),
        },
        { status: response.status || 500 }
      );
    }

    const responseData = await response.json();
    console.log("[FetchNewsArticleDetail] Backend response:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error("[FetchNewsArticleDetail] API error response:", responseData);
      return NextResponse.json(
        { message: responseData.error || `Failed to fetch news article: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("[FetchNewsArticleDetail] Fetch news article succeeded");
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("[FetchNewsArticleDetail] Fetch news article failed:", error.message);
    return NextResponse.json(
      { message: `Internal server error: Unable to fetch news article: ${error.message}` },
      { status: 500 }
    );
  }
}