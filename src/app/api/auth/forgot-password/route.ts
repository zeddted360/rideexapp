// app/api/auth/forgot-password/route.ts (server-side)
import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/utils/email";
import crypto from "crypto";
import { databases, validateServerEnv } from "@/utils/appwriteServer";
import { ID, Query } from "node-appwrite";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();


    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { databaseId, userCollectionId, recoveryTokensCollectionId } =
      validateServerEnv(); 

    // Find user by email (don't reveal if exists)
    const users = await databases.listDocuments(databaseId, userCollectionId, [
      Query.equal("email", email),
    ]);

    if (users.documents.length === 0) {
      // Silent success for security
      return NextResponse.json({ message: "Reset link sent if email exists" });
    }

    const user = users.documents[0];

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Save to recovery collection
    await databases.createDocument(
      databaseId,
      recoveryTokensCollectionId, // e.g., 'password_recoveries'
      ID.unique(),
      {
        userId: user.$id,
        token,
        expiresAt,
        used: false,
        email: user.email,
      }
    );

    // Build dynamic reset link
    const origin = process.env.APP_URL || "http://localhost:3000";
    const resetLink = `${origin}/reset-password?token=${token}&userId=${user.$id}`;

    // Send custom email
    await sendPasswordResetEmail({
      email: user.email,
      name: user.fullName || user.name,
      resetLink,
    });

    return NextResponse.json({ message: "Reset link sent if email exists" });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
