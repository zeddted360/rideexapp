// app/api/send-feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { rating, comment, phone, email, riderCode } = await request.json();

    if (!rating || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate star emojis
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    // Get rating color based on score
    const getRatingColor = (rating: number) => {
      if (rating >= 4) return "#10b981"; // green
      if (rating >= 3) return "#f59e0b"; // orange
      return "#ef4444"; // red
    };

    // Get rating label
    const getRatingLabel = (rating: number) => {
      if (rating === 5) return "Excellent";
      if (rating === 4) return "Good";
      if (rating === 3) return "Average";
      if (rating === 2) return "Poor";
      return "Very Poor";
    };

    const ratingColor = getRatingColor(rating);
    const ratingLabel = getRatingLabel(rating);

    // Enhanced HTML template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Feedback</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f3f4f6;
            padding: 20px;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
          }
          .content {
            padding: 40px 30px;
          }
          .rating-section {
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, ${ratingColor}15 0%, ${ratingColor}08 100%);
            border-radius: 12px;
            margin-bottom: 30px;
            border: 2px solid ${ratingColor}30;
          }
          .rating-stars {
            font-size: 36px;
            letter-spacing: 4px;
            color: ${ratingColor};
            margin-bottom: 12px;
          }
          .rating-label {
            font-size: 20px;
            font-weight: 600;
            color: ${ratingColor};
            margin-bottom: 8px;
          }
          .rating-score {
            font-size: 14px;
            color: #6b7280;
          }
          .info-grid {
            display: table;
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 16px;
          }
          .info-row {
            display: table-row;
          }
          .info-label {
            display: table-cell;
            font-weight: 600;
            color: #4b5563;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding-right: 20px;
            vertical-align: top;
            width: 140px;
          }
          .info-value {
            display: table-cell;
            color: #1f2937;
            font-size: 15px;
            vertical-align: top;
          }
          .comment-box {
            background-color: #f9fafb;
            border-left: 4px solid #ff6600;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .comment-box .info-label {
            display: block;
            margin-bottom: 10px;
          }
          .comment-text {
            color: #374151;
            font-size: 15px;
            line-height: 1.7;
            font-style: italic;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
          }
          .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-logo {
            font-size: 20px;
            font-weight: 700;
            color: #ff6600;
            margin-bottom: 12px;
          }
          .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
          }
          .footer-copyright {
            font-size: 12px;
            color: #9ca3af;
          }
          @media only screen and (max-width: 600px) {
            .content {
              padding: 30px 20px;
            }
            .rating-stars {
              font-size: 28px;
            }
            .header h1 {
              font-size: 24px;
            }
            .info-label {
              display: block;
              margin-bottom: 4px;
            }
            .info-value {
              display: block;
              margin-bottom: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>🚴 New Feedback Received</h1>
            <p>Customer satisfaction report</p>
          </div>
          
          <div class="content">
            <div class="rating-section">
              <div class="rating-stars">${stars}</div>
              <div class="rating-label">${ratingLabel}</div>
              <div class="rating-score">${rating} out of 5 stars</div>
            </div>

            ${
              comment
                ? `
            <div class="comment-box">
              <div class="info-label">💬 Customer Comment</div>
              <div class="comment-text">"${comment}"</div>
            </div>
            `
                : ""
            }

            <div class="divider"></div>

            <div class="info-grid">
              <div class="info-row">
                <div class="info-label">🚴 Rider Code</div>
                <div class="info-value">${riderCode || "Not provided"}</div>
              </div>
              <div class="info-row">
                <div class="info-label">📞 Phone Number</div>
                <div class="info-value">${phone}</div>
              </div>
              <div class="info-row">
                <div class="info-label">📧 Email Address</div>
                <div class="info-value">${email}</div>
              </div>
              <div class="info-row">
                <div class="info-label">📅 Submitted On</div>
                <div class="info-value">${new Date().toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}</div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-logo">RideEx</div>
            <p class="footer-text">This email was automatically generated from the RideEx Feedback System</p>
            <p class="footer-copyright">&copy; ${new Date().getFullYear()} RideEx. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configure Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER || "noreply@rideex.com",
      to: process.env.ADMIN_EMAIL || "admin@rideex.com",
      subject: `New ${ratingLabel} Feedback (${rating}★) - RideEx`,
      html: htmlTemplate,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 500 }
    );
  }
}
