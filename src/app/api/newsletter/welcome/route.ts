import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }


  // Configure SMTP transport using environment variables
  const transporter = nodemailer.createTransport({
   service:"gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"RideEx Newsletter" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to RideEx Newsletter!",
      html: `
        <h2>Welcome to RideEx!</h2>
        <p>Thank you for subscribing to our newsletter. You'll now receive exclusive offers and updates.</p>
        <p>Bon appétit!<br/>The RideEx Team</p>
      `,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
} 