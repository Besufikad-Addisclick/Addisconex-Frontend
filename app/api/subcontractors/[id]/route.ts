import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; 
type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const session = await getServerSession(authOptions);
    const { id } = await context.params; // Await the params Promise


  if (!session?.accessToken) {
    // console.error("No access token found in cookies");
    return NextResponse.json({ error: "Unauthorized: No access token provided" }, { status: 401 });
  }

  try {
    const url = `${API_BASE_URL}/auth/users/${id}/`;
    // console.log(`Fetching from backend: ${url}`);
    
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
    //   console.error(`Non-JSON response received: ${text.slice(0, 100)}...`);
      return NextResponse.json(
        { error: `Invalid response from server: Expected JSON, got ${contentType}` },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
    //   console.error(`Backend error: ${response.status} - ${data.error || "Unknown error"}`);
      return NextResponse.json(
        { error: data.error || `Failed to fetch user: ${response.status}` },
        { status: response.status }
      );
    }

    // console.log("Successfully fetched user data:", data.id);
    return NextResponse.json(data);
  } catch (error: any) {
    // console.error("Error fetching user:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
