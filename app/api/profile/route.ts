// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${API_URL}/auth/profile/`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  try {
    const formData = await request.formData();  
    const backendRes = await fetch(`${API_URL}/auth/profile/`, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${session.accessToken}`
      },
      body: formData,
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}