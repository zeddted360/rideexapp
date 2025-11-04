import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import { PromoOfferItemFormData } from "@/utils/schema";
import { IPromoOfferFetched } from "../../types/types";
import toast from "react-hot-toast";

interface IPromoOfferProps {
  offersItem: IPromoOfferFetched[];
  listLoading: "idle" | "pending" | "succeeded" | "failed";
  actionLoading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IPromoOfferProps = {
  offersItem: [],
  listLoading: "idle",
  actionLoading: "idle",
  error: null,
};

// Function to create a promo offer item
export const createAsyncOfferItem = createAsyncThunk<
  IPromoOfferFetched,
  Partial<PromoOfferItemFormData & { extras?: string[] }>,
  { rejectValue: string }
>("promoOffer/createOfferItem", async (data, { rejectWithValue }) => {
  try {
    const { databaseId, promoOfferBucketId, promoOfferCollectionId } =
      validateEnv();
    if (!data.image?.[0]) throw new Error("Promo offer image is required");

    const imageFile = await storage.createFile(
      promoOfferBucketId,
      ID.unique(),
      data.image[0] as File
    );

    const createdDocument = await databases.createDocument(
      databaseId,
      promoOfferCollectionId,
      ID.unique(),
      {
        name: data.name,
        description: data.description,
        originalPrice: data.originalPrice,
        discountedPrice: data.discountedPrice,
        image: imageFile.$id,
        category: data.category,
        restaurantId: data.restaurantId,
        isApproved: false,
        extras: data.extras || [],
      }
    );

    toast.success("Promo offer item created successfully!");
    return createdDocument as IPromoOfferFetched;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to create promo offer item: ${errorMsg}. Check extras IDs if provided.`);
    return rejectWithValue(errorMsg);
  }
});

// Function to list promo offer items
export const listAsyncPromoOfferItems = createAsyncThunk<
  IPromoOfferFetched[],
  void,
  { rejectValue: string }
>("promoOffer/listPromoOfferItems", async (_, { rejectWithValue }) => {
  try {
    const { databaseId, promoOfferCollectionId } = validateEnv();

    // Fetch all promo offer item documents
    const response = await databases.listDocuments(
      databaseId,
      promoOfferCollectionId,
      [Query.orderDesc("$createdAt")]
    );
    return response.documents as IPromoOfferFetched[];
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to fetch promo offer items: ${errorMsg}`);
    return rejectWithValue(errorMsg);
  }
});

// Function to update a promo offer item
export const updateAsyncOfferItem = createAsyncThunk<
  IPromoOfferFetched,
  { itemId: string; data: Partial<PromoOfferItemFormData & { extras?: string[] }>; newImage?: File | null },
  { rejectValue: string }
>("promoOffer/updatePromoOfferItem", async ({ itemId, data, newImage }, { rejectWithValue }) => {
  try {
    const { databaseId, promoOfferBucketId, promoOfferCollectionId } = validateEnv();

    let updateData = { 
      ...data,
      extras: data.extras !== undefined ? data.extras : undefined,
    };

    if (newImage) {
      // Upload new image
      const imageFile = await storage.createFile(
        promoOfferBucketId,
        ID.unique(),
        newImage
      );
      updateData.image = imageFile.$id;
    }

    const updatedDocument = await databases.updateDocument(
      databaseId,
      promoOfferCollectionId,
      itemId,
      updateData
    );

    toast.success("Promo offer item updated successfully!");
    return updatedDocument as IPromoOfferFetched;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to update promo offer item: ${errorMsg}. Check extras IDs if provided.`);
    return rejectWithValue(errorMsg);
  }
});

// Function to add an extra to a promo offer item
export const addExtraToOffer = createAsyncThunk<
  IPromoOfferFetched,
  { itemId: string; extraId: string },
  { rejectValue: string }
>("promoOffer/addExtraToOffer", async ({ itemId, extraId }, { rejectWithValue }) => {
  try {
    const { databaseId, promoOfferCollectionId } = validateEnv();

    // Fetch the current offer document
    const currentOffer = await databases.getDocument<IPromoOfferFetched>(
      databaseId,
      promoOfferCollectionId,
      itemId
    );

    // Ensure extras is an array; append if not duplicate
    const currentExtras = currentOffer.extras || [];
    if (!currentExtras.includes(extraId)) {
      const updatedExtras = [...currentExtras, extraId];
      const updatedDocument = await databases.updateDocument<IPromoOfferFetched>(
        databaseId,
        promoOfferCollectionId,
        itemId,
        { extras: updatedExtras }
      );
      toast.success("Extra added to offer successfully!");
      return updatedDocument;
    } else {
      toast.error("Extra is already included in this offer.");
      return currentOffer;
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to add extra to offer: ${errorMsg}`);
    return rejectWithValue(errorMsg);
  }
});

// Function to remove an extra from a promo offer item
export const removeExtraFromOffer = createAsyncThunk<
  IPromoOfferFetched,
  { itemId: string; extraId: string },
  { rejectValue: string }
>("promoOffer/removeExtraFromOffer", async ({ itemId, extraId }, { rejectWithValue }) => {
  try {
    const { databaseId, promoOfferCollectionId } = validateEnv();

    // Fetch the current offer document
    const currentOffer = await databases.getDocument<IPromoOfferFetched>(
      databaseId,
      promoOfferCollectionId,
      itemId
    );
    // Filter out the extraId from extras array
    const currentExtras = currentOffer.extras || [];
    const updatedExtras = currentExtras.filter((id) => id !== extraId);

    const updatedDocument = await databases.updateDocument<IPromoOfferFetched>(
      databaseId,
      promoOfferCollectionId,
      itemId,
      { extras: updatedExtras }
    );
    toast.success("Extra removed from offer successfully!");
    return updatedDocument;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to remove extra from offer: ${errorMsg}`);
    return rejectWithValue(errorMsg);
  }
});

// Function to approve/update approval status of a promo offer item
export const updateApprovalAsyncPromoOfferItem = createAsyncThunk<
  IPromoOfferFetched,
  { itemId: string; isApproved: boolean },
  { rejectValue: string }
>("promoOffer/updateApprovalPromoOfferItem", async ({ itemId, isApproved }, { rejectWithValue }) => {
  try {
    const { databaseId, promoOfferCollectionId } = validateEnv();

    const updatedDocument = await databases.updateDocument(
      databaseId,
      promoOfferCollectionId,
      itemId,
      { isApproved }
    );

    const status = isApproved ? "approved" : "rejected";
    toast.success(`Promo offer item ${status} successfully!`);
    return updatedDocument as IPromoOfferFetched;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to update promo offer item approval: ${errorMsg}`);
    return rejectWithValue(errorMsg);
  }
});

// Function to delete a promo offer item
export const deleteAsyncPromoOfferItem = createAsyncThunk<
  string,
  { itemId: string; imageId: string },
  { rejectValue: string }
>("promoOffer/deletePromoOfferItem", async ({ itemId, imageId }, { rejectWithValue }) => {
  try {
    const { databaseId, promoOfferCollectionId, promoOfferBucketId } = validateEnv();

    // Delete image if exists
    if (imageId) {
      await storage.deleteFile(promoOfferBucketId, imageId);
    }

    // Delete document
    await databases.deleteDocument(databaseId, promoOfferCollectionId, itemId);

    toast.success("Promo offer item deleted successfully!");
    return itemId;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to delete promo offer item: ${errorMsg}`);
    return rejectWithValue(errorMsg);
  }
});

export const promoOfferSlice = createSlice({
  name: "promoOffer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createAsyncOfferItem.pending, (state) => {
        state.actionLoading = "pending";
        state.error = null;
      })
      .addCase(
        createAsyncOfferItem.fulfilled,
        (state, action: PayloadAction<IPromoOfferFetched>) => {
          state.actionLoading = "succeeded";
          state.offersItem = [...state.offersItem, action.payload];
          state.error = null;
        }
      )
      .addCase(
        createAsyncOfferItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.actionLoading = "failed";
          state.error = action.payload || "Failed to create promo offer item";
        }
      )
      // List
      .addCase(listAsyncPromoOfferItems.pending, (state) => {
        state.listLoading = "pending";
        state.error = null;
      })
      .addCase(
        listAsyncPromoOfferItems.fulfilled,
        (state, action: PayloadAction<IPromoOfferFetched[]>) => {
          state.listLoading = "succeeded";
          state.offersItem = action.payload;
          state.error = null;
        }
      )
      .addCase(
        listAsyncPromoOfferItems.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.listLoading = "failed";
          state.error = action.payload || "Failed to fetch promo offer items";
        }
      )
      // Update
      .addCase(updateAsyncOfferItem.pending, (state) => {
        state.actionLoading = "pending";
        state.error = null;
      })
      .addCase(
        updateAsyncOfferItem.fulfilled,
        (state, action: PayloadAction<IPromoOfferFetched>) => {
          state.actionLoading = "succeeded";
          const index = state.offersItem.findIndex((item) => item.$id === action.payload.$id);
          if (index !== -1) {
            state.offersItem[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        updateAsyncOfferItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.actionLoading = "failed";
          state.error = action.payload || "Failed to update promo offer item";
        }
      )
      // Add Extra
      .addCase(addExtraToOffer.pending, (state) => {
        state.actionLoading = "pending";
        state.error = null;
      })
      .addCase(
        addExtraToOffer.fulfilled,
        (state, action: PayloadAction<IPromoOfferFetched>) => {
          state.actionLoading = "succeeded";
          const index = state.offersItem.findIndex((item) => item.$id === action.payload.$id);
          if (index !== -1) {
            state.offersItem[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        addExtraToOffer.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.actionLoading = "failed";
          state.error = action.payload || "Failed to add extra to offer";
        }
      )
      // Remove Extra
      .addCase(removeExtraFromOffer.pending, (state) => {
        state.actionLoading = "pending";
        state.error = null;
      })
      .addCase(
        removeExtraFromOffer.fulfilled,
        (state, action: PayloadAction<IPromoOfferFetched>) => {
          state.actionLoading = "succeeded";
          const index = state.offersItem.findIndex((item) => item.$id === action.payload.$id);
          if (index !== -1) {
            state.offersItem[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        removeExtraFromOffer.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.actionLoading = "failed";
          state.error = action.payload || "Failed to remove extra from offer";
        }
      )
      // Update Approval
      .addCase(updateApprovalAsyncPromoOfferItem.pending, (state) => {
        state.actionLoading = "pending";
        state.error = null;
      })
      .addCase(
        updateApprovalAsyncPromoOfferItem.fulfilled,
        (state, action: PayloadAction<IPromoOfferFetched>) => {
          state.actionLoading = "succeeded";
          const index = state.offersItem.findIndex((item) => item.$id === action.payload.$id);
          if (index !== -1) {
            state.offersItem[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        updateApprovalAsyncPromoOfferItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.actionLoading = "failed";
          state.error = action.payload || "Failed to update promo offer item approval";
        }
      )
      // Delete
      .addCase(deleteAsyncPromoOfferItem.pending, (state) => {
        state.actionLoading = "pending";
        state.error = null;
      })
      .addCase(
        deleteAsyncPromoOfferItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.actionLoading = "succeeded";
          state.offersItem = state.offersItem.filter((item) => item.$id !== action.payload);
          state.error = null;
        }
      )
      .addCase(
        deleteAsyncPromoOfferItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.actionLoading = "failed";
          state.error = action.payload || "Failed to delete promo offer item";
        }
      );
  },
});

export default promoOfferSlice.reducer;