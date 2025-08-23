import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'No access token found. Please log in again.' }, { status: 401 });
    }

    const formData = await req.formData();
    const packageId = formData.get('package_id') as string;
    const screenshot = formData.get('screenshot') as File;

    if (!packageId || !screenshot) {
      return NextResponse.json({ error: 'Package ID and screenshot are required' }, { status: 400 });
    }

    const uploadFormData = new FormData();
    uploadFormData.append('package_id', packageId);
    uploadFormData.append('screenshot', screenshot);

    const response = await fetch(`${apiUrl}/create-subscription/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch (e) {
        console.error('[upload-invoice] Fetch error:', text);
        return NextResponse.json(
          { error: `Failed to upload invoice: ${response.statusText}`, status: response.status },
          { status: response.status }
        );
      }
      console.error('[upload-invoice] Error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('[upload-invoice] Response:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[upload-invoice] Unexpected error:', error.message, error.stack);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}