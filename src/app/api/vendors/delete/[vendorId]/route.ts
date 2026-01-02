import { databases, users, serverConfig } from "@/utils/appwriteServer";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;

  if (!vendorId) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }

  try {
    // Delete vendor document
    await databases.deleteDocument(
      serverConfig.databaseId,
      serverConfig.vendorsCollectionId,
      vendorId
    );

    // Delete user profile document
    await databases.deleteDocument(
      serverConfig.databaseId,
      serverConfig.userCollectionId,
      vendorId
    );

    // Delete the Appwrite user account
    await users.delete(vendorId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Vendor deleted successfully",
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting vendor:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to delete vendor. Please try again later.",
      }),
      { status: 500 }
    );
  }
}
