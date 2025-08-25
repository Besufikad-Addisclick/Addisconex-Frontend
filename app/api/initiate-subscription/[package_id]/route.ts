import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; 

// Define the expected params type as a Promise
type RouteParams = {
  params: Promise<{ package_id: string }>;
};

export async function POST(req: NextRequest, context: RouteParams) {
  // Await the params Promise to get the actual params object
  const { package_id } = await context.params;

  const session = await getServerSession(authOptions);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  if (!session?.accessToken) {
    return NextResponse.json({ error: "No access token found. Please log in again." }, { status: 401 });
  }

  try {
    const response = await fetch(`${apiUrl}/initiate-subscription/${package_id}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to initiate AkiPay payment" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error initiating AkiPay payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}