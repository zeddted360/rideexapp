import { databases, serverConfig, users } from "@/utils/appwriteServer";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }

  try {
    const databaseId =
      serverConfig.databaseId || process.env.APPWRITE_DATABASE_ID!;

    // Attempt to delete vendor document (if exists) – silently ignore if not found
    try {
      await databases.deleteDocument(
        databaseId,
        serverConfig.vendorsCollectionId ||
          process.env.APPWRITE_VENDORS_COLLECTION_ID!,
        userId
      );
    } catch (vendorErr: any) {
      if (vendorErr.code !== 404) {
        // Log non-404 vendor errors server-side but continue (non-critical)
        console.error(
          `Non-critical error deleting vendor document for user ${userId}:`,
          vendorErr
        );
      }
    }

    // Critical: Delete user profile document
    await databases.deleteDocument(
      databaseId,
      serverConfig.userCollectionId ||
        process.env.APPWRITE_USERS_COLLECTION_ID!,
      userId
    );

    // Critical: Delete Appwrite account
    await users.delete(userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User deleted successfully",
      }),
      { status: 200 }
    );
  } catch (error: any) {
    // Log full details server-side for debugging (never expose to client)
    console.error(`Failed to delete user ${userId}:`, error);

    return new Response(
      JSON.stringify({
        error: "Failed to delete user. Please try again later.",
      }),
      { status: 500 }
    );
  }
}
