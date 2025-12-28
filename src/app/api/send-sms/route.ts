// app/api/send-sms/route.ts
import { formatNigerianPhone } from "@/utils/sendSmsToNumber";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, adminNumber, adminMessage } = body;

    if (adminMessage) {
      console.log(
        "The admin message received in api/send-sms is :",
        adminMessage
      );
    }

    // Validate required fields
    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to (phone number) and message" },
        { status: 400 }
      );
    }

    if (message.length > 160 || message.length === 0) {
      return NextResponse.json(
        { error: "Invalid message length (1-160 chars)" },
        { status: 400 }
      );
    }

    if (adminNumber && !adminMessage) {
      return NextResponse.json(
        {
          error:
            "Missing required field: adminMessage (when adminNumber is provided)",
        },
        { status: 400 }
      );
    }

    if (
      adminMessage &&
      (adminMessage.length > 160 || adminMessage.length === 0)
    ) {
      return NextResponse.json(
        { error: "Invalid adminMessage length (1-160 chars)" },
        { status: 400 }
      );
    }

    // Basic phone validation (Nigerian format) for to
    if (!/^(0|\+234)[789]\d{9}$/.test(to.replace("+", ""))) {
      return NextResponse.json(
        {
          error:
            "Invalid phone number format (use Nigerian number, e.g., 08012345678)",
        },
        { status: 400 }
      );
    }

    // Add validation for adminNumber if provided
    if (
      adminNumber &&
      !/^(0|\+234)[789]\d{9}$/.test(adminNumber.replace("+", ""))
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid admin phone number format (use Nigerian number, e.g., 08012345678)",
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

    // Send to customer (format to)
    await sendSMSToNumber(formatNigerianPhone(to), message, token, senderId);

    // Send to admin if provided (format adminNumber)
    if (adminNumber && adminMessage) {
      await sendSMSToNumber(
        formatNigerianPhone(adminNumber),
        adminMessage,
        token,
        senderId
      );
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

// Internal helper (unchanged)
async function sendSMSToNumber(
  to: string,
  message: string,
  token: string,
  senderId: string
) {
  const formData = new FormData();
  formData.append("token", token);
  formData.append("sender", senderId || "RideEx");
  formData.append("to", to);
  formData.append("message", message);
  formData.append("type", "0");
  formData.append("routing", "2");

  const response = await fetch(
    "https://app.smartsmssolutions.com/io/api/client/v1/sms/",
    {
      method: "POST",
      body: formData,
    }
  );

  const text = await response.text();


  const isSuccess =
    text.includes("OK") ||
    text.toLowerCase().includes("successful") ||
    text.toLowerCase().includes("queued") ||
    text.includes("Message sent") ||
    (text.includes("status") && text.includes('"OK"'));

  if (response.ok && isSuccess) {
    return { success: true, raw: text };
  }

  // Try to parse JSON only if it looks like JSON
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // not json → probably plain text error
    throw new Error(`SMS API failed (plain text): ${text.slice(0, 120)}`);
  }

  // JSON error cases
  if (data?.status?.toUpperCase() === "ERROR" || data?.error) {
    throw new Error(data.message || data.error || "SmartSMS rejected request");
  }

  // Last resort fallback (should be rare)
  throw new Error(`Unexpected SMS response format: ${text.slice(0, 120)}`);
}
