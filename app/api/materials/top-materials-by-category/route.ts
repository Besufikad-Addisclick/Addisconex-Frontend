import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function GET(req: Request) {
  try {
    // Forward query params if any
    const urlObj = new URL(req.url);
    const params = urlObj.search ? `?${urlObj.searchParams.toString()}` : "";
    const url = `${API_URL}/materials/top-materials-by-category/${params}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(
      "[api/materials/top-materials-by-category] Error:",
      error.message
    );
    return NextResponse.json(
      {
        error:
          error.message === "No access token available"
            ? "Unauthorized: Please log in."
            : "Failed to fetch top materials by category",
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      { status: 500 }
    );
  }
}
