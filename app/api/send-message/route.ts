import { NextRequest, NextResponse } from 'next/server';

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Validation rules - keep in sync with frontend
const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 50,
    required: true
  },
  email: {
    required: true
  },
  subject: {
    minLength: 5,
    maxLength: 100,
    required: true
  },
  message: {
    minLength: 10,
    maxLength: 1000,
    required: true
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: ContactMessage = await request.json();
    
    // Validate required fields
    const { name, email, subject, message } = body;
    
    // Check required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    if (!subject?.trim()) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < VALIDATION_RULES.name.minLength) {
      return NextResponse.json(
        { error: `Name must be at least ${VALIDATION_RULES.name.minLength} characters long` },
        { status: 400 }
      );
    }
    
    if (name.trim().length > VALIDATION_RULES.name.maxLength) {
      return NextResponse.json(
        { error: `Name must be no more than ${VALIDATION_RULES.name.maxLength} characters long` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate subject length
    if (subject.trim().length < VALIDATION_RULES.subject.minLength) {
      return NextResponse.json(
        { error: `Subject must be at least ${VALIDATION_RULES.subject.minLength} characters long` },
        { status: 400 }
      );
    }
    
    if (subject.trim().length > VALIDATION_RULES.subject.maxLength) {
      return NextResponse.json(
        { error: `Subject must be no more than ${VALIDATION_RULES.subject.maxLength} characters long` },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length < VALIDATION_RULES.message.minLength) {
      return NextResponse.json(
        { error: `Message must be at least ${VALIDATION_RULES.message.minLength} characters long` },
        { status: 400 }
      );
    }
    
    if (message.trim().length > VALIDATION_RULES.message.maxLength) {
      return NextResponse.json(
        { error: `Message must be no more than ${VALIDATION_RULES.message.maxLength} characters long` },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Log the contact request
    
    // For now, we'll just log and return success
    console.log('Contact form submission:', {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString()
    });

    // TODO: Implement actual message sending logic
    // Example: Save to database, send email, etc.

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message sent successfully! We will get back to you soon.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
