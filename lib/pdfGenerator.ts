import jsPDF from 'jspdf';

interface SubscriptionData {
  id: string;
  package_name: string;
  subscription_plan: string;
  amount: number;
  status: string;
  start_date: string;
  end_date: string;
  payment_method: string;
  payment_id: string | null;
  subscriber_name: string;
  created_at: string;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: string;
}

export const generateSubscriptionInvoice = (
  subscription: SubscriptionData,
  userProfile: UserProfile
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [210, 148] // Half A4 size (A5)
  }); 
  
  // Company Information
  const companyName = "AddisCon-EX";
  const companyAddress = "Addis Ababa, Ethiopia";
  const companyPhone = "+251-XXX-XXXXXX";
  const companyEmail = "support@addisconex.com";
  
  // Colors
  const primaryColor = [59, 130, 246]; // Blue
  const secondaryColor = [107, 114, 128]; // Gray
  const successColor = [34, 197, 94]; // Green
  
  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company Logo/Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 20, 25);
  
  // Invoice Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBSCRIPTION INVOICE', 140, 25);
  
  // Invoice Details Box
  doc.setFillColor(248, 250, 252);
  doc.rect(140, 30, 60, 25, 'F');
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(140, 30, 60, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Invoice #', 145, 37);
  doc.text('Date', 145, 42);
  doc.text('Status', 145, 47);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`SUB-${subscription.id.slice(-8).toUpperCase()}`, 165, 37);
  doc.text(new Date(subscription.created_at).toLocaleDateString(), 165, 42);
  
  // Status with color
  const statusColor = subscription.status === 'approved' ? successColor : 
                     subscription.status === 'pending' ? [251, 191, 36] : 
                     subscription.status === 'rejected' ? [239, 68, 68] : secondaryColor;
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(subscription.status.toUpperCase(), 165, 47);
  
  // Company Details
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(companyAddress, 20, 50);
  doc.text(`Phone: ${companyPhone}`, 20, 55);
  doc.text(`Email: ${companyEmail}`, 20, 60);
  
  // Customer Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 80);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${userProfile.first_name} ${userProfile.last_name}`, 20, 90);
  doc.text(userProfile.email , 20, 95);
  doc.text(userProfile.phone_number, 20, 100);
  doc.text(`User Type: ${userProfile.user_type.charAt(0).toUpperCase() + userProfile.user_type.slice(1)}`, 20, 105);
  
  // Subscription Details Section
  let currentY = 115;
  
  // Package Name
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Package Name:', 20, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(subscription.package_name, 60, currentY);
  doc.text('Amount:', 120, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${subscription.amount.toLocaleString('en-ET', { minimumFractionDigits: 2 })} ETB`, 150, currentY);
  currentY += 8;
  
  // Plan Type
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Plan Type:', 20, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(subscription.subscription_plan, 60, currentY);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Payment Method:', 120, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(subscription.payment_method, 150, currentY);
  currentY += 8;
  
  // Start Date
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Start Date:', 20, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(new Date(subscription.start_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), 60, currentY);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('End Date:', 120, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(new Date(subscription.end_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), 150, currentY);
  currentY += 8;
  
  // Subscription ID
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Subscription ID:', 20, currentY);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text(subscription.id, 60, currentY);
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Payment ID:', 120, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(subscription.payment_id || 'N/A', 150, currentY);
  currentY += 15;
  
  // Total Amount Section
  const finalY = currentY;
  
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(120, finalY, 80, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT', 125, finalY + 8);
  
  doc.setFontSize(16);
  doc.text(`${subscription.amount.toLocaleString('en-ET', { minimumFractionDigits: 2 })} ETB`, 125, finalY + 15);
  
  // Terms and Conditions
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Terms and Conditions:', 20, finalY + 35);
  doc.text('• This invoice is for subscription services provided by AddisCon-EX.', 20, finalY + 42);
  doc.text('• Payment is due upon receipt of this invoice.', 20, finalY + 47);
  doc.text('• For any queries, please contact our support team.', 20, finalY + 52);
  doc.text('• Thank you for choosing AddisCon-EX for your construction needs.', 20, finalY + 57);
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('© 2024 AddisCon-EX. All rights reserved.', 20, pageHeight - 12);
  doc.text('This is a computer-generated invoice.', 20, pageHeight - 7);
  
  // Save the PDF
  const fileName = `Invoice_${subscription.package_name.replace(/\s+/g, '_')}_${subscription.id.slice(-8)}.pdf`;
  doc.save(fileName);
};

export const generatePaymentReceipt = (
  subscription: SubscriptionData,
  userProfile: UserProfile
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [210, 148] // Half A4 size (A5)
  });
  
  // Company Information
  const companyName = "AddisCon-EX";
  const companyAddress = "Addis Ababa, Ethiopia";
  
  // Colors
  const primaryColor = [255, 116, 44]; // Orange #FF742C for receipt
  const secondaryColor = [107, 114, 128]; // Gray
  const bgColor = [255, 247, 237]; // Orange-50 background #FFF7ED
  
  // Background
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.rect(0, 0, 210, 148, 'F');
  
  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Company Logo/Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 15, 20);
  
  // Receipt Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', 90, 20);
  
  // Receipt Details Box
  doc.setFillColor(255, 255, 255);
  doc.rect(90, 22, 110, 15, 'F');
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(90, 22, 110, 15);
  
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Receipt #', 95, 28);
  doc.text('Date', 95, 32);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`RCP-${subscription.id.slice(-8).toUpperCase()}`, 120, 28);
  doc.text(new Date(subscription.created_at).toLocaleDateString(), 120, 32);
  
  // Company Details
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(companyAddress, 15, 40);
  
  // Customer Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Received From:', 15, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${userProfile.first_name} ${userProfile.last_name}`, 15, 63);
  doc.text(userProfile.email , 15, 68);
  
  // Payment Details Section
  let currentY = 80;
  
  // Description and Amount
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Description:', 15, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(subscription.package_name, 50, currentY);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Amount:', 100, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${subscription.amount.toLocaleString('en-ET', { minimumFractionDigits: 2 })} ETB`, 120, currentY);
  currentY += 6;
  
  // Plan Type
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Plan Type:', 15, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(subscription.subscription_plan, 50, currentY);
  currentY += 6;
  
  // Payment Method
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Payment Method:', 15, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(subscription.payment_method, 50, currentY);
  currentY += 6;
  
  // Payment ID
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Payment ID:', 15, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(subscription.payment_id || 'N/A', 50, currentY);
  currentY += 6;
  
  // Period
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Period:', 15, currentY);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text(`${new Date(subscription.start_date).toLocaleDateString()} - ${new Date(subscription.end_date).toLocaleDateString()}`, 50, currentY);
  currentY += 12;
  
  // Total Amount
  const finalY = currentY;
  
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(100, finalY, 100, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PAID', 105, finalY + 6);
  
  doc.setFontSize(14);
  doc.text(`${subscription.amount.toLocaleString('en-ET', { minimumFractionDigits: 2 })} ETB`, 105, finalY + 12);
  
  // Watermark Logo
  try {
    // Add watermark logo in center
    const logoUrl = '/stamp.png';
    doc.addImage(logoUrl, 'PNG', 60, 50, 40, 40, undefined, 'FAST');
  } catch (error) {
    console.log('Logo not found, continuing without watermark');
  }
  
  // Thank you message
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your payment!', 15, finalY + 25);
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, pageHeight - 15, 210, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('© 2024 AddisCon-EX. All rights reserved.', 15, pageHeight - 9);
  doc.text('This is a computer-generated receipt.', 15, pageHeight - 5);
  
  // Save the PDF
  const fileName = `Receipt_${subscription.package_name.replace(/\s+/g, '_')}_${subscription.id.slice(-8)}.pdf`;
  doc.save(fileName);
};
