// app/api/admin/send-promotion-code/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { email, fullName, code } = await request.json();


    if (!email || !code) {
      return NextResponse.json(
        { error: "Missing email or code" },
        { status: 400 }
      );
    }

    await transporter.sendMail({
      from: `"RideEx Admin" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "🔐 Admin Promotion Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
          <h2 style="color: #f97316; text-align: center;">RideEx Admin Promotion</h2>
          <p style="font-size: 16px;">Hello <strong>${
            fullName || email
          }</strong>,</p>
          <p style="font-size: 16px;">An administrator has requested to promote your account to <strong>Admin</strong>.</p>
          <div style="text-align: center; margin: 40px 0;">
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #f97316; background: #fff3cd; padding: 20px; border-radius: 12px; display: inline-block;">
              ${code}
            </p>
          </div>
          <p style="font-size: 16px; color: #dc2626;"><strong>This code expires in 10 minutes.</strong></p>
          <p style="font-size: 14px; color: #6b7280;">If you didn't request this, please ignore this email or contact support immediately.</p>
          <hr style="margin: 30px 0; border-color: #e5e7eb;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© RideEx Logistics • Secure Access</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email error:", error.message);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
