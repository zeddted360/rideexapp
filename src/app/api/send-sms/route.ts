// app/api/send-sms/route.ts
import { formatNigerianPhone } from "@/utils/sendSmsToNumber";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      message,
      adminNumber,
      customer,
      status,
      orderId,
      customMessage,
    } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: "Missing required field: to (phone number)" },
        { status: 400 }
      );
    }

    // Build message if not provided (use customMessage if available, else default)
    const finalMessage =
      message ||
      customMessage ||
      `Dear ${customer || "Customer"}, your order #${orderId} is now ${status
        .replace(/_/g, " ")
        .toLowerCase()}. Thank you for choosing us!`;

    if (!finalMessage || finalMessage.length > 160) {
      // SMS limit check
      return NextResponse.json(
        { error: "Invalid or too long message (max 160 chars)" },
        { status: 400 }
      );
    }

    // Basic phone validation (Nigerian format)
    if (!/^(0|\+234)[789]\d{9}$/.test(to.replace("+", ""))) {
      return NextResponse.json(
        {
          error:
            "Invalid phone number format (use Nigerian number, e.g., 08012345678)",
        },
        { status: 400 }
      );
    }

    // Get env vars (server-side only)
    const token = process.env.SMART_SMS_TOKEN;
    const senderId = process.env.SMART_SMS_SENDER_ID;

    if (!token || !senderId) {
      console.error("Missing env vars: SMART_SMS_TOKEN or SMART_SMS_SENDER_ID");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Send to customer
    await sendSMSToNumber(formatNigerianPhone(to), finalMessage, token, senderId);

    // Send to admin if provided
    if (adminNumber) {
      const adminMessage = `Admin Alert: Order #${orderId} for ${
        customer || "Customer"
      } (${to}) is now ${status.replace(/_/g, " ").toLowerCase()}.`;
      await sendSMSToNumber(adminNumber, adminMessage, token, senderId);
    }

    return NextResponse.json({
      success: true,
      message: "SMS sent successfully",
      sentTo: [to, ...(adminNumber ? [adminNumber] : [])],
    });
  } catch (error) {
    console.error("Error in /api/send-sms:", error);
    return NextResponse.json(
      { error: "Failed to send SMS: " + (error as Error).message },
      { status: 500 }
    );
  }
}

// Internal helper
async function sendSMSToNumber(
  to: string,
  message: string,
  token: string,
  senderId: string
) {
  const formData = new FormData();
  formData.append("token", token);
  formData.append("sender", senderId);
  formData.append("to", to);
  formData.append("message", message);
  formData.append("type", "0"); // Adjust if needed (0 = plain text)
  formData.append("routing", "3"); // For DND in Nigeria

  const response = await fetch(
    "https://app.smartsmssolutions.com/io/api/client/v1/sms/",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.text();
  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch {
    parsedData = { state: "success" }; // Fallback if not JSON
  }

  if (parsedData.state !== "success") {
    throw new Error(parsedData.Message || "Unknown SMS API error");
  }

  return parsedData;
}
