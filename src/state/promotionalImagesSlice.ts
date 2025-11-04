// state/promotionalImagesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { storage, validateEnv } from "@/utils/appwrite";
import { ID, Models } from "appwrite";
import { AppDispatch } from "./store"; // Adjust path as needed

// Shared function to get promo images
const getPromoImages = async (): Promise<Models.File[]> => {
  const { promoImagesBucketId } = validateEnv();
  const response = await storage.listFiles(promoImagesBucketId);
  return response.files
    .filter((file) => file.name.startsWith("promo_"))
    .sort(
      (a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    )
    .slice(0, 2);
};

// Async Thunks
export const fetchPromotionalImages = createAsyncThunk(
  "promotionalImages/fetch",
  async () => {
    return await getPromoImages();
  }
);

export const createPromotionalImage = createAsyncThunk(
  "promotionalImages/create",
  async (file: File) => {
    const { promoImagesBucketId } = validateEnv();
    const customName = `promo_${Date.now()}_${file.name}`;
    const renamedFile = new File([file], customName, { type: file.type });
    await storage.createFile(promoImagesBucketId, ID.unique(), renamedFile);
    return await getPromoImages(); // Fetch updated list
  }
);

export const updatePromotionalImage = createAsyncThunk(
  "promotionalImages/update",
  async ({ fileId, file }: { fileId: string; file: File }) => {
    const { promoImagesBucketId } = validateEnv();
    await storage.deleteFile(promoImagesBucketId, fileId);
    const customName = `promo_${Date.now()}_${file.name}`;
    const renamedFile = new File([file], customName, { type: file.type });
    await storage.createFile(promoImagesBucketId, ID.unique(), renamedFile);
    return await getPromoImages(); // Fetch updated list
  }
);

export const deletePromotionalImage = createAsyncThunk(
  "promotionalImages/delete",
  async (fileId: string) => {
    const { promoImagesBucketId } = validateEnv();
    await storage.deleteFile(promoImagesBucketId, fileId);
    return await getPromoImages(); // Fetch updated list
  }
);

// Slice
interface PromotionalImagesState {
  images: Models.File[];
  loading: boolean;
  error: string | null;
}

const initialState: PromotionalImagesState = {
  images: [],
  loading: false,
  error: null,
};

const promotionalImagesSlice = createSlice({
  name: "promotionalImages",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchPromotionalImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionalImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
      })
      .addCase(fetchPromotionalImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch images";
      })
      // Create
      .addCase(createPromotionalImage.pending, (state) => {
        state.error = null;
      })
      .addCase(createPromotionalImage.fulfilled, (state, action) => {
        state.images = action.payload;
      })
      .addCase(createPromotionalImage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to create image";
      })
      // Update
      .addCase(updatePromotionalImage.pending, (state) => {
        state.error = null;
      })
      .addCase(updatePromotionalImage.fulfilled, (state, action) => {
        state.images = action.payload;
      })
      .addCase(updatePromotionalImage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update image";
      })
      // Delete
      .addCase(deletePromotionalImage.pending, (state) => {
        state.error = null;
      })
      .addCase(deletePromotionalImage.fulfilled, (state, action) => {
        state.images = action.payload;
      })
      .addCase(deletePromotionalImage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete image";
      });
  },
});

export const { clearError } = promotionalImagesSlice.actions;
export default promotionalImagesSlice.reducer;
