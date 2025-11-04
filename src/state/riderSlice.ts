import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { IRiders, IRidersFetched } from "../../types/types";
import { ID, Query } from "appwrite";

export const listAsyncRiders = createAsyncThunk(
  "riders/listAsyncRiders",
  async () => {
    try {
      const { databaseId, ridersCollectionId } = validateEnv();
      const response = await databases.listDocuments(
        databaseId,
        ridersCollectionId,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );
      return response.documents as IRidersFetched[];
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch riders");
    }
  }
);

export const createRiderAsync = createAsyncThunk(
  "riders/createRider",
  async (riderData: {
    formData: IRiders;
    driversLicensePicture?: File | null;
  }) => {
    try {
      const { databaseId, ridersCollectionId, driversLicenceBucketId } = validateEnv();

      let driversLicensePictureId = null;
      if (riderData.driversLicensePicture) {
        const uploadedFile = await storage.createFile(
          driversLicenceBucketId,
          ID.unique(),
          riderData.driversLicensePicture
        );
        driversLicensePictureId = uploadedFile.$id;
      }

      const riderId = ID.unique();
      const documentData = {
        ...riderData.formData,
        driversLicensePicture: driversLicensePictureId || "",
        referralCode: riderId,
        status: "pending",
        refferedBy: riderData.formData.referralCode,
      };

      const response = await databases.createDocument(
        databaseId,
        ridersCollectionId,
        riderId,
        documentData
      );

      // Notify server to send emails
      await fetch("/api/become-a-rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentData),
      });

      return response as IRidersFetched;
    } catch (error: any) {
      throw new Error(error.message || "Failed to create rider");
    }
  }
);

export const updateRiderStatusAsync = createAsyncThunk(
  "riders/updateStatus",
  async ({ riderId, newStatus }: { riderId: string; newStatus: "pending" | "approved" | "rejected" }) => {
    try {
      const { databaseId, ridersCollectionId } = validateEnv();
      const response = await databases.updateDocument(
        databaseId,
        ridersCollectionId,
        riderId,
        { status: newStatus }
      );
      return response as IRidersFetched;
    } catch (error: any) {
      throw new Error(error.message || "Failed to update rider status");
    }
  }
);

export const deleteRiderAsync = createAsyncThunk(
  "riders/delete",
  async (riderId: string) => {
    try {
      const { databaseId, ridersCollectionId, userCollectionId } = validateEnv();
      // Delete rider document
      await databases.deleteDocument(databaseId, ridersCollectionId, riderId);
      return riderId;
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete rider");
    }
  }
);

interface RiderState {
  riders: IRidersFetched[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
}

const initialState: RiderState = {
  riders: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
};

const riderSlice = createSlice({
  name: "riders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listAsyncRiders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listAsyncRiders.fulfilled, (state, action) => {
        state.loading = false;
        state.riders = action.payload;
      })
      .addCase(listAsyncRiders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch riders";
      })
      .addCase(createRiderAsync.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createRiderAsync.fulfilled, (state, action) => {
        state.createLoading = false;
        state.riders.push(action.payload);
      })
      .addCase(createRiderAsync.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.error.message || "Failed to create rider";
      })
      .addCase(updateRiderStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRiderStatusAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.riders.findIndex((r) => r.$id === action.payload.$id);
        if (index !== -1) {
          state.riders[index] = action.payload;
        }
      })
      .addCase(updateRiderStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update rider status";
      })
      .addCase(deleteRiderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRiderAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.riders = state.riders.filter((r) => r.$id !== action.payload);
      })
      .addCase(deleteRiderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete rider";
      });
  },
});

export default riderSlice.reducer;