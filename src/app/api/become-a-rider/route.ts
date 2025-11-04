import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Environment variables (ensure these are in .env.local)
const { SMTP_USER, SMTP_PASS } = process.env;

export async function POST(req: NextRequest) {
  if (!SMTP_USER || !SMTP_PASS) {
    return NextResponse.json({ error: "Missing SMTP configuration" }, { status: 500 });
  }

  const {
    fullName,
    email,
    phone,
    address,
    gender,
    dateOfBirth,
    nin,
    bvn,
    driversLicensePicture,
    vehicleType,
    previousWorkPlace,
    workDuration,
    guarantor1Name,
    guarantor1Phone,
    guarantor1Relationship,
    guarantor2Name,
    guarantor2Phone,
    guarantor2Relationship,
    referralCode,
    referredBy,
  } = await req.json();

  // Basic validation (already handled client-side, but server-side check for security)
  const requiredFields = [
    fullName,
    email,
    phone,
    address,
    gender,
    dateOfBirth,
    nin,
    vehicleType,
    previousWorkPlace,
    workDuration,
    guarantor1Name,
    guarantor1Phone,
    guarantor1Relationship,
    guarantor2Name,
    guarantor2Phone,
    guarantor2Relationship,
  ];
  if (requiredFields.some((field) => !field)) {
    return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 });
  }

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    // Email to Admin
    const adminMailOptions = {
      from: SMTP_USER,
      to: process.env.ADMIN_EMAIL, 
      subject: "New Rider Application",
      text: `New rider application received:\n\nFull Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nGender: ${gender}\nDate of Birth: ${dateOfBirth}\nNIN: ${nin}\nBVN: ${bvn || 'Not provided'}\nDriver's License Picture ID: ${driversLicensePicture || 'Not uploaded'}\nVehicle Type: ${vehicleType}\nPrevious Work Place: ${previousWorkPlace}\nWork Duration: ${workDuration}\nGuarantor 1 Name: ${guarantor1Name}\nGuarantor 1 Phone: ${guarantor1Phone}\nGuarantor 1 Relationship: ${guarantor1Relationship}\nGuarantor 2 Name: ${guarantor2Name}\nGuarantor 2 Phone: ${guarantor2Phone}\nGuarantor 2 Relationship: ${guarantor2Relationship}\nReferral Code: ${referralCode || 'Generated'}\nReferred By: ${referredBy || 'None'}\n\nPlease review and follow up.`,
    };

    // Email to Rider
    const riderMailOptions = {
      from: SMTP_USER,
      to: email,
      subject: "RideEx Rider Application Received",
      text: `Dear ${fullName},\n\nThank you for applying to become a RideEx rider! We have received your application with the following details:\n\n- Email: ${email}\n- Phone: ${phone}\n- Address: ${address}\n- Gender: ${gender}\n- Date of Birth: ${dateOfBirth}\n- NIN: ${nin}\n- BVN: ${bvn || 'Not provided'}\n- Driver's License Picture: ${driversLicensePicture ? 'Uploaded' : 'Not uploaded'}\n- Vehicle Type: ${vehicleType}\n- Previous Work Place: ${previousWorkPlace}\n- Work Duration: ${workDuration}\n- Guarantor 1 Name: ${guarantor1Name}\n- Guarantor 1 Phone: ${guarantor1Phone}\n- Guarantor 1 Relationship: ${guarantor1Relationship}\n- Guarantor 2 Name: ${guarantor2Name}\n- Guarantor 2 Phone: ${guarantor2Phone}\n- Guarantor 2 Relationship: ${guarantor2Relationship}\n- Referral Code: ${referralCode || 'Generated'}\n- Referred By: ${referredBy || 'None'}\n\nOur team will review your application and contact you soon. Stay tuned!\n\nBest,\nRideEx Team`,
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(riderMailOptions);

    return NextResponse.json({ message: "Application submitted and notifications sent" });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: "Failed to send notifications. Please try again later." }, { status: 500 });
  }
}