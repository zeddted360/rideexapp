// state/headerSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import { Models } from "node-appwrite";

interface HeaderConfig extends Models.Document {
  title: string;
  subtitle: string;
  logoType: "icon" | "image";
  logoUrl: string | null;
}

interface HeaderState {
  headerConfig: HeaderConfig | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: HeaderState = {
  headerConfig: null,
  loading: "idle",
  error: null,
};

const env = validateEnv();

// Fetch header configuration
export const fetchHeaderConfig = createAsyncThunk(
  "header/fetchConfig",
  async (_, { rejectWithValue }) => {
    try {
      const { offerHeaderConfigCollectionId, offerHeaderLogoBucketId } =
        validateEnv();

      const response = await databases.listDocuments(
        offerHeaderConfigCollectionId,
        offerHeaderLogoBucketId,
        [Query.limit(1), Query.orderDesc("$createdAt")]
      );

      if (response.documents.length > 0) {
        return response.documents[0] as HeaderConfig;
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch header configuration"
      );
    }
  }
);

// Create header configuration
export const createHeaderConfig = createAsyncThunk(
  "header/createConfig",
  async (
    data: {
      title: string;
      subtitle: string;
      logoType: "icon" | "image";
      logoFile: File | null;
      currentLogoId: string | null;
    },
    { rejectWithValue }
  ) => {
    try {
      let logoId: string | null = null;

      // Upload logo if provided
      if (data.logoType === "image" && data.logoFile) {
        const uploadResponse = await storage.createFile(
          validateEnv().offerHeaderLogoBucketId,
          ID.unique(),
          data.logoFile
        );
        logoId = uploadResponse.$id;
      }

      // Create document
      const document = await databases.createDocument(
        validateEnv().databaseId,
        validateEnv().offerHeaderConfigCollectionId,
        ID.unique(),
        {
          title: data.title,
          subtitle: data.subtitle,
          logoType: data.logoType,
          logoUrl: logoId,
        }
      );

      return document as HeaderConfig;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to create header configuration"
      );
    }
  }
);

// Update header configuration
export const updateHeaderConfig = createAsyncThunk(
  "header/updateConfig",
  async (
    {
      configId,
      data,
    }: {
      configId: string;
      data: {
        title: string;
        subtitle: string;
        logoType: "icon" | "image";
        logoFile: File | null;
        currentLogoId: string | null;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      let logoId: string | null = data.currentLogoId;

      // Handle logo changes
      if (data.logoType === "icon" && data.currentLogoId) {
        // Remove old logo if switching to icon
        try {
          await storage.deleteFile(
            validateEnv().offerHeaderLogoBucketId,
            data.currentLogoId
          );
        } catch (error) {
          console.warn("Failed to delete old logo:", error);
        }
        logoId = null;
      } else if (data.logoType === "image" && data.logoFile) {
        // Delete old logo if exists
        if (data.currentLogoId) {
          try {
            await storage.deleteFile(
              validateEnv().offerHeaderLogoBucketId,
              data.currentLogoId
            );
          } catch (error) {
            console.warn("Failed to delete old logo:", error);
          }
        }

        // Upload new logo
        const uploadResponse = await storage.createFile(
          validateEnv().offerHeaderLogoBucketId,
          ID.unique(),
          data.logoFile
        );
        logoId = uploadResponse.$id;
      }

      // Update document
      const document = await databases.updateDocument(
        validateEnv().databaseId,
        validateEnv().offerHeaderConfigCollectionId,
        configId,
        {
          title: data.title,
          subtitle: data.subtitle,
          logoType: data.logoType,
          logoUrl: logoId,
        }
      );

      return document as HeaderConfig;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update header configuration"
      );
    }
  }
);

// Delete header configuration (reset to default)
export const deleteHeaderConfig = createAsyncThunk(
  "header/deleteConfig",
  async (
    { configId, logoId }: { configId: string; logoId: string },
    { rejectWithValue }
  ) => {
    try {
      // Delete logo if exists
      if (logoId) {
        try {
          await storage.deleteFile(
            validateEnv().offerHeaderLogoBucketId,
            logoId
          );
        } catch (error) {
          console.warn("Failed to delete logo:", error);
        }
      }

      // Delete document
      await databases.deleteDocument(
        validateEnv().databaseId,
        validateEnv().offerHeaderConfigCollectionId,
        configId
      );

      return configId;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to delete header configuration"
      );
    }
  }
);

const headerSlice = createSlice({
  name: "header",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch header config
      .addCase(fetchHeaderConfig.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchHeaderConfig.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.headerConfig = action.payload;
      })
      .addCase(fetchHeaderConfig.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Create header config
      .addCase(createHeaderConfig.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(createHeaderConfig.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.headerConfig = action.payload;
      })
      .addCase(createHeaderConfig.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Update header config
      .addCase(updateHeaderConfig.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(updateHeaderConfig.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.headerConfig = action.payload;
      })
      .addCase(updateHeaderConfig.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // Delete header config
      .addCase(deleteHeaderConfig.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(deleteHeaderConfig.fulfilled, (state) => {
        state.loading = "succeeded";
        state.headerConfig = null;
      })
      .addCase(deleteHeaderConfig.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = headerSlice.actions;
export default headerSlice.reducer;
