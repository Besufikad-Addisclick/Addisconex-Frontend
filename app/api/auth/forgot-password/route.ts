import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    
    console.log('Forgot password request for email:', email);
    console.log('Calling backend API:', `${apiUrl}/auth/password-reset/`);

    // Call backend API
    const response = await fetch(`${apiUrl}/auth/password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend forgot password error:', data);
      
      // Handle different error types
      if (response.status === 404) {
        return NextResponse.json(
          { message: 'No account found with this email address' },
          { status: 404 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { message: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      } else if (data.errors) {
        return NextResponse.json(
          { errors: data.errors },
          { status: response.status }
        );
      } else {
        return NextResponse.json(
          { message: data.detail || data.message || 'Failed to send reset email' },
          { status: response.status }
        );
      }
    }

    console.log('Password reset email sent successfully');
    
    return NextResponse.json({
      message: 'Password reset email sent successfully',
      success: true,
    });

  } catch (error: any) {
    console.error('Forgot password API error:', error);
    
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
