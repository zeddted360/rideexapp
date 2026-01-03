// app/api/auth/reset-password/route.ts (new server route for completing reset)
import { NextResponse } from "next/server";
import { databases, users, validateServerEnv } from "@/utils/appwriteServer";
import { Query } from "node-appwrite";

export async function POST(request: Request) {
  try {
    const { userId, token, newPassword } = await request.json();

    if (!userId || !token || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { databaseId, recoveryTokensCollectionId } = validateServerEnv(); 

    // Find token
    const tokens = await databases.listDocuments(
      databaseId,
      recoveryTokensCollectionId,
      [
        Query.equal("token", token),
        Query.equal("userId", userId),
        Query.equal("used", false),
      ]
    );

    if (tokens.documents.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const tokenDoc = tokens.documents[0];

    // Check expiration
    const expiresAt = new Date(tokenDoc.expiresAt);
    if (new Date() > expiresAt) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    // Update password using server SDK
      await users.updatePassword(userId, newPassword);

    // Mark token as used
    await databases.updateDocument(
      databaseId,
      recoveryTokensCollectionId,
      tokenDoc.$id,
      {
        used: true,
      }
    );

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
