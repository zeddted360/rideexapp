import toast from "react-hot-toast";

// utils/sendSmsToNumber.ts
export async function sendOrderFeedback({
  customer,
  number,
  status,
  adminNumber,
  orderId,
  message, // Optional custom message
}: {
  customer: string;
  number: string;
  status: string;
  adminNumber?: string;
  orderId: string;
  message?: string; // Optional - if provided, uses this; else builds default
}) {
  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: number,
        message, // Send as-is (backend will handle if undefined)
        adminNumber,
        customer,
        status,
        orderId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(`SMS notification failed: ${data.error || response.status}`,{duration:8000});
      console.warn("SMS failed but order processing continues:", data);
      return { success: false }; // Non-blocking: return failure but don't throw
    }

    console.log("SMS sent successfully:", data);
    return { success: true }; // Success indicator
  } catch (error) {
    console.error("Error sending SMS:", error);
    toast.error(
      `SMS notification failed: ${(error as Error).message}`
    );
    return { success: false }; // Non-blocking: continue order flow
  }
}


// Handles formats like: +234xxxxxxxxx, 234xxxxxxxxx, 0xxxxxxxxx
// Assumes input is a valid Nigerian mobile number (10 digits after country code)
export function formatNigerianPhone(phone: string): string {
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');

  // Check if it starts with 234 (international without +)
  if (digitsOnly.startsWith('234')) {
    return '0' + digitsOnly.slice(3); // Convert to 0xxxxxxxxx
  }

  // Check if it starts with +234
  if (phone.startsWith('+234')) {
    return '0' + digitsOnly.slice(3);
  }

  // If already starts with 0 and has 11 digits, return as-is
  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    return digitsOnly;
  }

  // If it's 10 digits (assuming local format), prepend 0 if needed
  if (digitsOnly.length === 10) {
    return '0' + digitsOnly;
  }

  // Invalid: throw or return original (customize as needed)
  throw new Error('Invalid Nigerian phone number format');
}

