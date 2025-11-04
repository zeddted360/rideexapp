import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import toast from "react-hot-toast";
import { IDiscount, IDiscountFetched } from "../../types/types";

interface DiscountState {
  discounts: IDiscountFetched[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DiscountState = {
  discounts: [],
  loading: "idle",
  error: null,
};

// Helper function to update isApproved for expired discounts
const updateExpiredDiscounts = async (
  databaseId: string,
  discountsCollectionId: string,
  discounts: IDiscountFetched[]
) => {
  const now = new Date().toISOString();
  const expiredDiscounts = discounts.filter(
    (discount) => new Date(discount.validTo) < new Date(now) && discount.isApproved
  );

  for (const discount of expiredDiscounts) {
    try {
      await databases.updateDocument(
        databaseId,
        discountsCollectionId,
        discount.$id,
        { isApproved: false }
      );
    } catch (error) {
      console.error(
        `Failed to update isApproved for discount ${discount.$id}:`,
        error
      );
    }
  }
};

// Async thunk for listing discounts
export const listAsyncDiscounts = createAsyncThunk<
  IDiscountFetched[],
  void,
  { rejectValue: string }
>("discount/listDiscounts", async (_, { rejectWithValue }) => {
  try {
    const { databaseId, discountsCollectionId } = validateEnv();

    const response = await databases.listDocuments(
      databaseId,
      discountsCollectionId,
      [
        Query.orderDesc("validTo"), // Order by expiry descending
        Query.equal("isActive", true), // Only active discounts
      ]
    );

    const discounts = response.documents as IDiscountFetched[];

    // Update isApproved for expired discounts
    await updateExpiredDiscounts(databaseId, discountsCollectionId, discounts);

    // Fetch updated discounts after setting isApproved
    const updatedResponse = await databases.listDocuments(
      databaseId,
      discountsCollectionId,
      [
        Query.orderDesc("validTo"),
        Query.equal("isActive", true),
      ]
    );

    return updatedResponse.documents as IDiscountFetched[];
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to fetch discounts: ${errorMsg}`);
    return rejectWithValue(errorMsg);
  }
});

// Async thunk for creating discount
export const createAsyncDiscount = createAsyncThunk<
  IDiscountFetched,
  Partial<IDiscount>,
  { rejectValue: string }
>("discount/createDiscount", async (data, { rejectWithValue }) => {
  try {
    const { databaseId, discountsCollectionId, discountBucketId } = validateEnv();

    let imageId: string | undefined;
    if (data.image && (data.image as FileList)[0]) {
      // Upload image if provided
      const uploadedFile = await storage.createFile(
        discountBucketId,
        ID.unique(),
        (data.image as FileList)[0] as File
      );
      imageId = uploadedFile.$id;
    }

    const createdDocument = await databases.createDocument(
      databaseId,
      discountsCollectionId,
      ID.unique(),
      {
        title: data.title,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        originalPrice: data.originalPrice,
        discountedPrice: data.discountedPrice,
        validFrom: data.validFrom,
        validTo: data.validTo,
        minOrderValue: data.minOrderValue,
        maxUses: data.maxUses,
        code: data.code,
        appliesTo: data.appliesTo,
        targetId: data.targetId,
        image: imageId,
        isActive: data.isActive ?? true,
        isApproved: data.isApproved ?? false, // Set default to false for new discounts
        usageCount: 0,
        extras: data.extras || [],
        restaurantId: data.restaurantId || null,
      }
    );

    toast.success("Discount created successfully!");
    return createdDocument as IDiscountFetched;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to create discount: ${errorMsg}. Check extras IDs if provided.`);
    return rejectWithValue(errorMsg);
  }
});

// Async thunk for updating discount
export const updateAsyncDiscount = createAsyncThunk<
  IDiscountFetched,
  { id: string; data: Partial<Omit<IDiscount, "image"> & { extras?: string[] }>; imageFile?: File | null },
  { rejectValue: string }
>("discount/updateDiscount", async ({ id, data, imageFile }, { rejectWithValue }) => {
  try {
    const { databaseId, discountsCollectionId, discountBucketId } = validateEnv();
    let imageId: string | undefined; // If not updating image, keep existing
    if (imageFile && imageFile instanceof File) {
      // Upload new image if provided
      const uploadedFile = await storage.createFile(
        discountBucketId,
        ID.unique(),
        imageFile
      );
      imageId = uploadedFile.$id;
      // TODO: Delete old image if exists (fetch current and delete)
    }

    const updatePayload = {
      ...data,
      ...(imageId !== undefined && { image: imageId }),
      extras: data.extras !== undefined ? data.extras : undefined, // Ensure extras is array or undefined
    };

    const updatedDocument = await databases.updateDocument(
      databaseId,
      discountsCollectionId,
      id,
      updatePayload
    );

    toast.success("Discount updated successfully!");
    return updatedDocument as IDiscountFetched;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to update discount: ${errorMsg}. Check extras IDs if provided.`);
    console.error("Error updating discount:", error);
    return rejectWithValue(errorMsg);
  }
});

// Async thunk for deleting discount
export const deleteAsyncDiscount = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("discount/deleteDiscount", async (id, { rejectWithValue }) => {
  try {
    const { databaseId, discountsCollectionId } = validateEnv();

    await databases.deleteDocument(databaseId, discountsCollectionId, id);

    toast.success("Discount deleted successfully!");
    return id;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to delete discount: ${errorMsg}`);
    return rejectWithValue(errorMsg);
  }
});

// Slice
export const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle listAsyncDiscounts
    builder
      .addCase(listAsyncDiscounts.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        listAsyncDiscounts.fulfilled,
        (state, action: PayloadAction<IDiscountFetched[]>) => {
          state.loading = "succeeded";
          state.discounts = action.payload;
          state.error = null;
        }
      )
      .addCase(
        listAsyncDiscounts.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to fetch discounts";
        }
      )
      // Handle createAsyncDiscount
      .addCase(createAsyncDiscount.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        createAsyncDiscount.fulfilled,
        (state, action: PayloadAction<IDiscountFetched>) => {
          state.loading = "succeeded";
          state.discounts = [...state.discounts, action.payload];
          state.error = null;
        }
      )
      .addCase(
        createAsyncDiscount.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to create discount";
        }
      )
      // Handle updateAsyncDiscount
      .addCase(updateAsyncDiscount.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        updateAsyncDiscount.fulfilled,
        (state, action: PayloadAction<IDiscountFetched>) => {
          state.loading = "succeeded";
          state.discounts = state.discounts.map((d) =>
            d.$id === action.payload.$id ? action.payload : d
          );
          state.error = null;
        }
      )
      .addCase(
        updateAsyncDiscount.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to update discount";
        }
      )
      // Handle deleteAsyncDiscount
      .addCase(deleteAsyncDiscount.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        deleteAsyncDiscount.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = "succeeded";
          state.discounts = state.discounts.filter((d) => d.$id !== action.payload);
          state.error = null;
        }
      )
      .addCase(
        deleteAsyncDiscount.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to delete discount";
        }
      );
  },
});

export default discountSlice.reducer;