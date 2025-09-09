// Test utility for PDF generation
// This file can be used to test PDF generation functionality

import { generateSubscriptionInvoice, generatePaymentReceipt } from './pdfGenerator';

export const testPdfGeneration = () => {
  // Sample subscription data for testing
  const sampleSubscription = {
    id: "12345678-1234-1234-1234-123456789012",
    package_name: "Professional Plan",
    subscription_plan: "Monthly",
    amount: 2500.00,
    status: "approved",
    start_date: "2024-01-01",
    end_date: "2024-01-31",
    payment_method: "Bank Transfer",
    payment_id: "TXN123456789",
    subscriber_name: "John Doe",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z"
  };

  const sampleUserProfile = {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone_number: "+251912345678",
    user_type: "professionals"
  };

  // Test invoice generation
  console.log("Generating test invoice...");
  generateSubscriptionInvoice(sampleSubscription, sampleUserProfile);
  
  // Test receipt generation
  console.log("Generating test receipt...");
  generatePaymentReceipt(sampleSubscription, sampleUserProfile);
  
  console.log("PDF generation test completed!");
};

// Uncomment the line below to run the test
// testPdfGeneration();
