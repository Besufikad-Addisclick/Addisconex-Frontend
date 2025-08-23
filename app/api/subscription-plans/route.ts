import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'No access token found. Please log in again.' }, { status: 401 });
    }

    const response = await fetch(`${apiUrl}/user-subscription-plans/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch (e) {
        console.error('[subscription-plans] Fetch error:', text);
        return NextResponse.json(
          { error: `Failed to fetch subscription plans: ${response.statusText}`, status: response.status },
          { status: response.status }
        );
      }
      console.error('[subscription-plans] Error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('[subscription-plans] Response:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[subscription-plans] Unexpected error:', error.message, error.stack);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}