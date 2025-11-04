import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  // Extract request body
  const { email, fullName, message } = await req.json();
  console.log("the datal is ", email, fullName, message)

  // Basic validation
  const requiredFields = [email, fullName, message];
  if (requiredFields.some((field) => !field)) {
    return NextResponse.json(
      { error: "Email, full name, and message are required" },
      { status: 400 }
    );
  }

  // Set up Nodemailer transporter for Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER, // Your Gmail address
      pass: process.env.SMTP_PASS, // Your Gmail app-specific password
    },
  });

  try {
    // Email to Rider
    const riderMailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "RideEx Rider Application Approved",
        text: `Dear ${fullName},\n\n${message}\n\nBest regards,\nRideEx Team`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>RideEx Rider Approval</title>
            <style>
              /* Inline CSS for better email client compatibility */
              body {
                font-family: Arial, Helvetica, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #ff6200;
                color: #ffffff;
                text-align: center;
                padding: 20px;
              }
              .header img {
                max-width: 150px;
              }
              .content {
                padding: 20px 30px;
                color: #444;
                line-height: 1.6;
              }
              .content h1 {
                color: #ff6200;
                font-size: 24px;
                margin-bottom: 10px;
              }
              .content p {
                margin: 10px 0;
              }
              .footer {
                background-color: #f8f8f8;
                text-align: center;
                padding: 15px;
                font-size: 12px;
                color: #777;
                border-top: 1px solid #ddd;
              }
              .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #ff6200;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 15px;
              }
              .button:hover {
                background-color: #e65c00;
              }
              @media only screen and (max-width: 600px) {
                .container {
                  width: 100% !important;
                }
                .content {
                  padding: 15px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="/logo.webp" alt="RideEx" style="display: block; margin: 0 auto;">
              </div>
              <div class="content">
                <h1>Welcome to RideEx, ${fullName}!</h1>
                <p>We are thrilled to inform you that your rider application has been approved. Here are the details:</p>
                <p><strong></strong> ${message}</p>
                <p>Please log in to your RideEx account or contact our support team to proceed with the next steps. We're excited to have you on board!</p>
                <a href="https://your-rideex-website.com/login" class="button">Log In Now</a>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} RideEx. All rights reserved.</p>
                <p>Contact us: <a href="mailto:support@rideexapp.com" style="color: #ff6200;">support@rideexapp.com</a> | Phone: +234-800-123-4567</p>
                <p>123 RideEx, Owerri, Nigeria</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    // Send email
    const info = await transporter.sendMail(riderMailOptions);

    console.log("Email sent:", info.response);
    return NextResponse.json({ message: "Email sent successfully to rider" });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}