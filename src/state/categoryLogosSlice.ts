// state/categoryLogosSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storage, validateEnv } from '@/utils/appwrite';
import { ID, Models } from 'appwrite';

type LogosStateType = {
  restaurant: Models.File | null;
  shops: Models.File | null;
  pharmacy: Models.File | null;
};

interface UpdateLogoPayload {
  category: string;
  file: File;
}

interface DeleteLogoPayload {
  category: string;
}

const initialState = {
  logos: { restaurant: null, shops: null, pharmacy: null } as LogosStateType,
  loading: false,
  error: null as string | null,
};

export const listAsyncLogos = createAsyncThunk(
  'categoryLogos/listAsyncLogos',
  async (): Promise<LogosStateType> => {
    const { categoryLogosBucketId } = validateEnv();
    const response = await storage.listFiles(categoryLogosBucketId);
    const filesArray = response.files;
    const restaurantLogo = filesArray.find((f: Models.File) => f.name.startsWith('restaurant-logo'));
    const shopsLogo = filesArray.find((f: Models.File) => f.name.startsWith('shops-logo'));
    const pharmacyLogo = filesArray.find((f: Models.File) => f.name.startsWith('pharmacy-logo'));
    return {
      restaurant: restaurantLogo || null,
      shops: shopsLogo || null,
      pharmacy: pharmacyLogo || null,
    };
  }
);

export const updateAsyncLogo = createAsyncThunk(
  'categoryLogos/updateAsyncLogo',
  async ({ category, file }: UpdateLogoPayload): Promise<LogosStateType> => {
    const { categoryLogosBucketId } = validateEnv();
    // Fetch current files to check for existing
    const response = await storage.listFiles(categoryLogosBucketId);
    const current = response.files.find((f: Models.File) => f.name.startsWith(`${category}-logo`));
    if (current) {
      await storage.deleteFile(categoryLogosBucketId, current.$id);
    }
    // Create new file
    const ext = file.name.split('.').pop() || 'png';
    const newName = `${category}-logo.${ext}`;
    const newFile = new File([file], newName, { type: file.type });
    await storage.createFile(categoryLogosBucketId, ID.unique(), newFile);
    // Refetch all logos
    const newResponse = await storage.listFiles(categoryLogosBucketId);
    const filesArray = newResponse.files;
    const restaurantLogo = filesArray.find((f: Models.File) => f.name.startsWith('restaurant-logo'));
    const shopsLogo = filesArray.find((f: Models.File) => f.name.startsWith('shops-logo'));
    const pharmacyLogo = filesArray.find((f: Models.File) => f.name.startsWith('pharmacy-logo'));
    return {
      restaurant: restaurantLogo || null,
      shops: shopsLogo || null,
      pharmacy: pharmacyLogo || null,
    };
  }
);

export const deleteAsyncLogo = createAsyncThunk(
  'categoryLogos/deleteAsyncLogo',
  async (category: string): Promise<LogosStateType> => {
    const { categoryLogosBucketId } = validateEnv();
    // Fetch current files to find the one to delete
    const response = await storage.listFiles(categoryLogosBucketId);
    const current = response.files.find((f: Models.File) => f.name.startsWith(`${category}-logo`));
    if (current) {
      await storage.deleteFile(categoryLogosBucketId, current.$id);
    }
    // Refetch all logos
    const newResponse = await storage.listFiles(categoryLogosBucketId);
    const filesArray = newResponse.files;
    const restaurantLogo = filesArray.find((f: Models.File) => f.name.startsWith('restaurant-logo'));
    const shopsLogo = filesArray.find((f: Models.File) => f.name.startsWith('shops-logo'));
    const pharmacyLogo = filesArray.find((f: Models.File) => f.name.startsWith('pharmacy-logo'));
    return {
      restaurant: restaurantLogo || null,
      shops: shopsLogo || null,
      pharmacy: pharmacyLogo || null,
    };
  }
);

const categoryLogosSlice = createSlice({
  name: 'categoryLogos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listAsyncLogos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listAsyncLogos.fulfilled, (state, action) => {
        state.loading = false;
        state.logos = action.payload;
      })
      .addCase(listAsyncLogos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch logos';
      })
      .addCase(updateAsyncLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAsyncLogo.fulfilled, (state, action) => {
        state.loading = false;
        state.logos = action.payload;
      })
      .addCase(updateAsyncLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update logo';
      })
      .addCase(deleteAsyncLogo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAsyncLogo.fulfilled, (state, action) => {
        state.loading = false;
        state.logos = action.payload;
      })
      .addCase(deleteAsyncLogo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete logo';
      });
  },
});

export const categoryLogosReducer = categoryLogosSlice.reducer;
export default categoryLogosSlice;