import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; 

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    // console.log('Request body:', body);
    
    // Forward the request to the backend with the same field names
    const backendResponse = await fetch(`${apiUrl}/auth/change-password/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: body.old_password,
        new_password: body.new_password,
        confirm_password: body.confirm_password
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      // console.log('Password change backend error:', errorData);
      
      // Format the error message to be more user-friendly
      let errorMessage = 'Failed to change password';
      
      if (errorData.old_password) {
        errorMessage = errorData.old_password.join(' ');
      } else if (errorData.new_password) {
        errorMessage = errorData.new_password.join(' ');
      } else if (errorData.confirm_password) {
        errorMessage = errorData.confirm_password.join(' ');
      } else if (errorData.non_field_errors) {
        errorMessage = errorData.non_field_errors.join(' ');
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData // Include full error details for debugging
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    // console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}