import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const {
      vendorEmail,
      vendorName,
      businessName,
      status,
      phoneNumber,
      catchmentArea,
      location,
      category,
      whatsappUpdates,
    } = await request.json();

    // Validate required fields
    if (!vendorEmail || !vendorName || !businessName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Helper function to generate styled HTML email
    const generateStyledEmail = (content: string) => `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>RideEx Notification</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #1f2937; 
              background: linear-gradient(135deg, #fef3c7 0%, #fecaca 100%);
              margin: 0; 
              padding: 20px; 
            }
            .email-wrapper { 
              max-width: 650px; 
              margin: 0 auto; 
              background: #ffffff; 
              border-radius: 16px; 
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            }
            .header { 
              background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: pulse 15s ease-in-out infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            .logo { 
              color: #ffffff; 
              font-size: 32px; 
              font-weight: 800; 
              text-decoration: none; 
              display: block;
              margin-bottom: 12px;
              letter-spacing: 1px;
              position: relative;
              z-index: 1;
            }
            .header h1 { 
              color: #ffffff; 
              margin: 0; 
              font-size: 24px; 
              font-weight: 600;
              position: relative;
              z-index: 1;
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 {
              color: #1f2937;
              font-size: 22px;
              margin-bottom: 16px;
              font-weight: 600;
            }
            .content p {
              color: #4b5563;
              margin-bottom: 20px;
              font-size: 15px;
            }
            .details-section {
              background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
              border: 2px solid #f97316;
            }
            .details-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
              gap: 16px; 
              margin-top: 16px;
            }
            .detail-item { 
              background: #ffffff; 
              padding: 16px; 
              border-radius: 10px; 
              border-left: 4px solid #f97316;
              transition: all 0.3s ease;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            .detail-item:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
            }
            .detail-label { 
              font-weight: 600; 
              color: #6b7280; 
              font-size: 12px; 
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 6px; 
            }
            .detail-value { 
              color: #1f2937; 
              font-size: 16px;
              font-weight: 500;
            }
            .detail-value a { 
              color: #f97316; 
              text-decoration: none;
              transition: color 0.2s ease;
            }
            .detail-value a:hover { 
              color: #ea580c;
              text-decoration: underline; 
            }
            .status-approved { 
              background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
              border-left-color: #22c55e;
            }
            .status-pending { 
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border-left-color: #f59e0b;
            }
            .status-rejected { 
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
              border-left-color: #ef4444;
            }
            .whatsapp-badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: #22c55e;
              color: #ffffff;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
            }
            .whatsapp-badge-no {
              background: #9ca3af;
            }
            .info-box {
              background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
              padding: 16px;
              border-radius: 10px;
              border-left: 4px solid #22c55e;
              margin: 20px 0;
            }
            .info-box strong {
              color: #065f46;
            }
            .footer { 
              text-align: center; 
              padding: 30px; 
              background: #f9fafb;
              color: #6b7280; 
              font-size: 13px; 
            }
            .footer p {
              margin: 8px 0;
            }
            .btn { 
              display: inline-block; 
              background: linear-gradient(135deg, #f97316, #ef4444); 
              color: white !important; 
              padding: 14px 32px; 
              text-decoration: none; 
              border-radius: 10px; 
              font-weight: 600; 
              margin: 16px 0;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
            }
            .btn:hover { 
              background: linear-gradient(135deg, #ea580c, #dc2626);
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
            }
            .divider {
              height: 2px;
              background: linear-gradient(90deg, transparent, #f97316, transparent);
              margin: 24px 0;
            }
            @media (max-width: 600px) { 
              .details-grid { grid-template-columns: 1fr; } 
              .content { padding: 24px 20px; }
              .header { padding: 30px 20px; }
              .logo { font-size: 28px; }
              .header h1 { font-size: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <a href="https://rideexapp.com" class="logo">RideEx</a>
              <h1>${
                status ? "Vendor Status Update" : "New Vendor Registration"
              }</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p><strong>&copy; 2025 RideEx.</strong> All rights reserved.</p>
              <p>If you didn't expect this email, please ignore it or contact support.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Admin notification email (for new registration or status update)
    const adminContent = status
      ? `
        <p>A vendor's status has been updated. Please review the details below:</p>
        <div class="details-section">
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Vendor Name</div>
              <div class="detail-value">${vendorName}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Business Name</div>
              <div class="detail-value">${businessName}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Email</div>
              <div class="detail-value"><a href="mailto:${vendorEmail}">${vendorEmail}</a></div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Phone</div>
              <div class="detail-value"><a href="tel:${phoneNumber}">${phoneNumber}</a></div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Category</div>
              <div class="detail-value">${category}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Catchment Area</div>
              <div class="detail-value">${catchmentArea}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Location</div>
              <div class="detail-value">${location}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">WhatsApp Updates</div>
              <div class="detail-value">
                <span class="whatsapp-badge ${
                  whatsappUpdates ? "" : "whatsapp-badge-no"
                }">
                  ${whatsappUpdates ? "✓ Enabled" : "✗ Disabled"}
                </span>
              </div>
            </div>
            <div class="detail-item status-${status}">
              <div class="detail-label">Status</div>
              <div class="detail-value">${
                status.charAt(0).toUpperCase() + status.slice(1)
              }</div>
            </div>
          </div>
        </div>
        <div style="text-align: center;">
          <a href="https://rideexapp.com/admin" class="btn">Manage Vendors</a>
        </div>
      `
      : `
        <p>A new vendor has registered and is awaiting your approval. Review the details:</p>
        <div class="details-section">
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Vendor Name</div>
              <div class="detail-value">${vendorName}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Business Name</div>
              <div class="detail-value">${businessName}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Email</div>
              <div class="detail-value"><a href="mailto:${vendorEmail}">${vendorEmail}</a></div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Phone</div>
              <div class="detail-value"><a href="tel:${phoneNumber}">${phoneNumber}</a></div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Category</div>
              <div class="detail-value">${category}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Catchment Area</div>
              <div class="detail-value">${catchmentArea}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Location</div>
              <div class="detail-value">${location}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">WhatsApp Updates</div>
              <div class="detail-value">
                <span class="whatsapp-badge ${
                  whatsappUpdates ? "" : "whatsapp-badge-no"
                }">
                  ${whatsappUpdates ? "✓ Enabled" : "✗ Disabled"}
                </span>
              </div>
            </div>
            <div class="detail-item status-pending">
              <div class="detail-label">Status</div>
              <div class="detail-value">Pending Approval</div>
            </div>
          </div>
        </div>
        <div style="text-align: center;">
          <a href="https://rideexapp.com/admin/dashboard" class="btn">Review Application</a>
        </div>
      `;

    const adminMailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: status
        ? `Vendor Status Updated: ${businessName}`
        : "New Vendor Registration Pending Approval",
      html: generateStyledEmail(adminContent),
    };

    // Vendor notification email
    const vendorContent = status
      ? `
        <h2>Dear ${vendorName},</h2>
        <p>Your vendor application for <strong>${businessName}</strong> has been reviewed.</p>
        <div class="details-section">
          <div class="details-grid">
            <div class="detail-item status-${status}">
              <div class="detail-label">Application Status</div>
              <div class="detail-value">${
                status.charAt(0).toUpperCase() + status.slice(1)
              }</div>
            </div>
            ${
              status === "approved"
                ? `
                  <div class="detail-item">
                    <div class="detail-label">Next Steps</div>
                    <div class="detail-value">Your account is now active! Log in to manage orders and customers.</div>
                  </div>
                `
                : `
                  <div class="detail-item">
                    <div class="detail-label">Contact Support</div>
                    <div class="detail-value"><a href="mailto:support@rideex.com">support@rideex.com</a></div>
                  </div>
                `
            }
          </div>
        </div>
        ${
          status === "approved"
            ? '<div style="text-align: center;"><a href="https://rideexapp.com/vendor/" class="btn">Access Your Dashboard</a></div>'
            : "<p>If you believe this was an error or need assistance, reply to this email or contact our support team.</p>"
        }
      `
      : `
        <h2>Welcome, ${vendorName}!</h2>
        <p>Thank you for registering your business <strong>${businessName}</strong> with RideEx.</p>
        <p>Your account is under review and will be activated soon. Here's a summary of your registration:</p>
        <div class="details-section">
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Business Email</div>
              <div class="detail-value"><a href="mailto:${vendorEmail}">${vendorEmail}</a></div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Business Phone</div>
              <div class="detail-value"><a href="tel:${phoneNumber}">${phoneNumber}</a></div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Category</div>
              <div class="detail-value">${category}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Catchment Area</div>
              <div class="detail-value">${catchmentArea}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Location</div>
              <div class="detail-value">${location}</div>
            </div>
            <div class="detail-item status-pending">
              <div class="detail-label">Status</div>
              <div class="detail-value">Pending Approval</div>
            </div>
          </div>
        </div>
        ${
          whatsappUpdates
            ? `
              <div class="info-box">
                <strong>✓ WhatsApp Updates Enabled</strong><br>
                You'll receive instant notifications about orders, deliveries, and business insights via WhatsApp at <strong>${phoneNumber}</strong>.
              </div>
            `
            : ""
        }
        <div class="divider"></div>
        <p style="text-align: center; color: #6b7280;">We'll notify you once your application is approved. Questions? <a href="mailto:support@rideex.com" style="color: #f97316; font-weight: 600;">Contact our support team</a>.</p>
      `;

    const vendorMailOptions = {
      from: process.env.GMAIL_USER,
      to: vendorEmail,
      subject: status
        ? `Your Vendor Application Status: ${
            status.charAt(0).toUpperCase() + status.slice(1)
          }`
        : "Welcome to RideEx!",
      html: generateStyledEmail(vendorContent),
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(vendorMailOptions),
    ]);

    return NextResponse.json(
      { message: "Notifications sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending notifications:", error);
    return NextResponse.json(
      { message: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
