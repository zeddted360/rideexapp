// utils/email.ts
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

// Use process.cwd() for reliable root-relative paths in Next.js
const templatesDir = path.join(process.cwd(), "emails", "templates");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".hbs",
      partialsDir: path.join(templatesDir, "partials"), // optional, can be empty
      layoutsDir: path.join(templatesDir, "layouts"),
      defaultLayout: "main.hbs",
    },
    viewPath: templatesDir,
    extName: ".hbs",
  })
);

// Send function (unchanged)
export async function sendPasswordResetEmail({
  email,
  name,
  resetLink,
}: {
  email: string;
  name: string | null;
  resetLink: string;
}) {
  const mailOptions = {
    from: `"RideEx Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your RideEx Password",
    template: "password-reset",
    context: {
      name: name || "User",
      resetLink,
      year: new Date().getFullYear(),
      supportEmail: process.env.SUPPORT_EMAIL || "support@rideexaap.com",
    },
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Email send failed:", error);
    throw new Error("Failed to send password reset email");
  }
}
