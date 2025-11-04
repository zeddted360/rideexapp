import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { databases, validateEnv } from "@/utils/appwrite";
import { IVendorFetched } from "../../types/types";
import { Query } from "appwrite";

export const listAsyncVendors = createAsyncThunk(
  "vendors/listAsyncVendors",
  async () => {
    try {
      const { databaseId, vendorsCollectionId } = validateEnv();
      const response = await databases.listDocuments(
        databaseId,
        vendorsCollectionId,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );
      return response.documents as IVendorFetched[];
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch vendors");
    }
  }
);

export const fetchVendorByIdAsync = createAsyncThunk(
  "vendors/fetchById",
  async (vendorId: string) => {
    try {
      const { databaseId, vendorsCollectionId } = validateEnv();
      const response = await databases.getDocument(
        databaseId,
        vendorsCollectionId,
        vendorId
      );
      return response as IVendorFetched;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch vendor");
    }
  }
);

export const updateVendorStatusAsync = createAsyncThunk(
  "vendors/updateStatus",
  async ({ vendorId, newStatus }: { vendorId: string; newStatus: string }) => {
    try {
      const { databaseId, vendorsCollectionId } = validateEnv();
      const response = await databases.updateDocument(
        databaseId,
        vendorsCollectionId,
        vendorId,
        { status: newStatus }
      );
      return response as IVendorFetched;
    } catch (error: any) {
      throw new Error(error.message || "Failed to update vendor status");
    }
  }
);

export const deleteVendorAsync = createAsyncThunk(
  "vendors/delete",
  async (vendorId: string) => {
    try {
      const { databaseId, vendorsCollectionId, userCollectionId } = validateEnv();
      // Delete vendor document
      await databases.deleteDocument(databaseId, vendorsCollectionId, vendorId);
      // Delete user profile document (user.$id === vendorId)
      await databases.deleteDocument(databaseId, userCollectionId, vendorId);
      return vendorId;
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete vendor");
    }
  }
);

interface VendorState {
  vendors: IVendorFetched[];
  selectedVendor: IVendorFetched | null;
  loading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  vendors: [],
  selectedVendor: null,
  loading: false,
  error: null,
};

const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listAsyncVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listAsyncVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(listAsyncVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch vendors";
      })
      .addCase(fetchVendorByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVendor = action.payload;
      })
      .addCase(fetchVendorByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch vendor";
      })
      .addCase(updateVendorStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendorStatusAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendors.findIndex((v) => v.$id === action.payload.$id);
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
        // Also update selectedVendor if it matches
        if (state.selectedVendor?.$id === action.payload.$id) {
          state.selectedVendor = action.payload;
        }
      })
      .addCase(updateVendorStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update vendor status";
      })
      .addCase(deleteVendorAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendorAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = state.vendors.filter((v) => v.$id !== action.payload);
        // Clear selectedVendor if it was the deleted one
        if (state.selectedVendor?.$id === action.payload) {
          state.selectedVendor = null;
        }
      })
      .addCase(deleteVendorAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete vendor";
      });
  },
});

export default vendorSlice.reducer;