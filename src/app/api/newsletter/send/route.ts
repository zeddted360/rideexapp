import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { subject, content, emails } = await req.json();
  if (!subject || !content) {
    return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
  }
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: "No subscribers found" }, { status: 404 });
  }

  // Configure SMTP transport (same as welcome route)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send email to each subscriber sequentially
  try {
    const results: { email: string; success: boolean }[] = [];

    for (const email of emails as string[]) {
      try {
        await transporter.sendMail({
          from: `"RideEx Newsletter" <${process.env.SMTP_USER}>`,
          to: email,
          subject,
          html: content,
        });
        results.push({ email, success: true });
      } catch {
        results.push({ email, success: false });
      }
    }
    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).map(r => r.email);
    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 });
  }
} 