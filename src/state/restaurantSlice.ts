// restaurantSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import toast from "react-hot-toast";
import { IRestaurant, IRestaurantFetched } from "../../types/types";

interface IResProp {
  restaurants: IRestaurantFetched[];
  selectedRestaurant: IRestaurantFetched | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IResProp = {
  restaurants: [],
  selectedRestaurant: null,
  loading: "idle",
  error: null,
};

export const createAsyncRestaurant = createAsyncThunk<
  IRestaurantFetched,
  IRestaurant,
  { rejectValue: string }
>("restaurant/createRestaurant", async (data, { rejectWithValue }) => {
  try {
    // Validate input data
    if (!data.logo[0]) {
      throw new Error("Restaurant logo is required");
    }

    const { databaseId, restaurantBucketId, restaurantsCollectionId } =
      validateEnv();

    // Upload logo
    const logoFile = await storage.createFile(
      restaurantBucketId,
      ID.unique(),
      data.logo[0] as File
    );

    // Create restaurant document
    const createdDocument = await databases.createDocument(
      databaseId,
      restaurantsCollectionId,
      ID.unique(),
      {
        name: data.name,
        logo: logoFile.$id,
        rating: data.rating,
        deliveryTime: data.deliveryTime,
        category: data.category,
        vendorId: data.vendorId,
        // Stringify each schedule object to store as string[]
        schedule: data.schedule?.map((day) => JSON.stringify(day)),
        addresses: data.addresses || [],
        createdAt: new Date().toISOString(),
        isPaused: false,
      }
    );

    toast.success("Restaurant added successfully!");
    return createdDocument as IRestaurantFetched;
  } catch (error) {
    toast.error(
      `Failed to create restaurant: ${
        error instanceof Error ? error.message : "Failed to load restaurant"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to load restaurant"
    );
  }
});


// Async thunk for listing restaurants (no change needed, but ensure addresses is handled)
export const listAsyncRestaurants = createAsyncThunk<
  IRestaurantFetched[],
  void,
  { rejectValue: string }
>("restaurant/listRestaurants", async (_, { rejectWithValue }) => {
  try {
    const { databaseId, restaurantsCollectionId } = validateEnv();

    // Fetch all restaurant documents
    const response = await databases.listDocuments(
      databaseId,
      restaurantsCollectionId,
      [Query.orderDesc("$createdAt")] 
    );

    // Parse schedule from string[] to object array
    const parsedRestaurants = response.documents.map((doc) => ({
      ...doc,
      schedule: doc.schedule
        ? doc.schedule.map((str: string) => JSON.parse(str))
        : undefined,
    })) as IRestaurantFetched[];

    return parsedRestaurants;
  } catch (error) {
    console.error(`Failed to fetch restaurants: ${error instanceof Error ? error.message : "Failed to load restaurant"}`);
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to load restaurant"
    );
  }
});


// Async thunk for getting a restaurant by ID
export const getAsyncRestaurantById = createAsyncThunk<
  IRestaurantFetched,
  string,
  { rejectValue: string }
>("restaurant/getRestaurantById", async (id, { rejectWithValue }) => {
  try {
    const { databaseId, restaurantsCollectionId } = validateEnv();
    const response = await databases.getDocument(
      databaseId,
      restaurantsCollectionId,
      id
    );

    // Parse schedule from string[] to object array
    const parsedRestaurant = {
      ...response,
      schedule: response.schedule
        ? response.schedule.map((str: string) => JSON.parse(str))
        : undefined,
    } as IRestaurantFetched;

    return parsedRestaurant;
  } catch (error) {
    console.error(error);
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch restaurant"
    );
  }
});

// Enhanced Async thunk for updating restaurant
export const updateAsyncRestaurant = createAsyncThunk<
  IRestaurantFetched,
  { id: string; data: Partial<IRestaurant> },
  { rejectValue: string }
>("restaurant/updateRestaurant", async ({ id, data }, { rejectWithValue }) => {
  try {
    const { databaseId, restaurantsCollectionId, restaurantBucketId } = validateEnv();
    let updateData: any = {
      name: data.name,
      category: data.category,
      deliveryTime: data.deliveryTime,
      rating: data.rating,
      schedule:
        data.schedule && data.schedule?.map((day) => JSON.stringify(day)),
      addresses: data.addresses || [],
      vendorId:data.vendorId,
    };
    // Handle logo update if new file provided
    if (data.logo instanceof FileList && data.logo.length > 0) {
      // Upload new logo
      const uploadedFile = await storage.createFile(
        restaurantBucketId,
        ID.unique(),
        data.logo[0] as File
      );
      updateData.logo = uploadedFile.$id;
      // Fetch current document to get old logo ID and delete old logo
      const currentDoc: IRestaurantFetched = await databases.getDocument(
        databaseId,
        restaurantsCollectionId,
        id
      );
      // Delete old logo file if it exists
      if (typeof currentDoc.logo === "string" && currentDoc.logo) {
        await storage.deleteFile(restaurantBucketId, currentDoc.logo);
      }
    }
    // If no new logo, do not include 'logo' in updateData (keeps existing value)
    const updatedDocument = await databases.updateDocument(
      databaseId,
      restaurantsCollectionId,
      id,
      updateData
    );

    toast.success("Restaurant updated successfully!");
    return updatedDocument as IRestaurantFetched;
  } catch (error) {
    toast.error(
      `Failed to update restaurant: ${
        error instanceof Error ? error.message : "Failed to update restaurant"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to update restaurant"
    );
  }
});

// Async thunk for toggling restaurant pause status
export const toggleRestaurantStatusAsync = createAsyncThunk<
  IRestaurantFetched,
  string,
  { rejectValue: string }
>("restaurant/toggleRestaurantStatus", async (id, { rejectWithValue }) => {
  try {
    const { databaseId, restaurantsCollectionId } = validateEnv();

    // Fetch current restaurant document
    const currentDoc = (await databases.getDocument(
      databaseId,
      restaurantsCollectionId,
      id
    )) as IRestaurantFetched;

    // Toggle the isPaused value (default to false if not present)
    const newIsPaused = !currentDoc.isPaused;

    // Update the document with the new isPaused value
    const updatedDoc = await databases.updateDocument(
      databaseId,
      restaurantsCollectionId,
      id,
      { isPaused: newIsPaused }
    );

    // Parse schedule from string[] to object array
    const parsedRestaurant = {
      ...updatedDoc,
      schedule: updatedDoc.schedule
        ? updatedDoc.schedule.map((str: string) => JSON.parse(str))
        : undefined,
    } as IRestaurantFetched;

    toast.success(
      `Restaurant ${newIsPaused ? "paused" : "resumed"} successfully!`
    );
    return parsedRestaurant;
  } catch (error) {
    toast.error(
      `Failed to toggle restaurant status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to toggle restaurant status"
    );
  }
});

// Async thunk for deleting restaurant
export const deleteAsyncRestaurant = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("restaurant/deleteRestaurant", async (id, { rejectWithValue }) => {
  try {
    const { databaseId, restaurantsCollectionId } = validateEnv();

    await databases.deleteDocument(databaseId, restaurantsCollectionId, id);

    toast.success("Restaurant deleted successfully!");
    return id;
  } catch (error) {
    toast.error(
      `Failed to delete restaurant: ${
        error instanceof Error ? error.message : "Failed to delete restaurant"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to delete restaurant"
    );
  }
});

// Slice
export const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle createAsyncRestaurant
    builder
      .addCase(createAsyncRestaurant.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        createAsyncRestaurant.fulfilled,
        (state, action: PayloadAction<IRestaurantFetched>) => {
          state.loading = "succeeded";
          state.restaurants = [...state.restaurants, action.payload];
          state.error = null;
        }
      )
      .addCase(
        createAsyncRestaurant.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to create restaurant";
        }
      )
      // Handle listAsyncRestaurants
      .addCase(listAsyncRestaurants.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        listAsyncRestaurants.fulfilled,
        (state, action: PayloadAction<IRestaurantFetched[]>) => {
          state.loading = "succeeded";
          state.restaurants = action.payload;
          state.error = null;
        }
      )
      .addCase(
        listAsyncRestaurants.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to fetch restaurants";
        }
      )
      // Handle getAsyncRestaurantById
      .addCase(getAsyncRestaurantById.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        getAsyncRestaurantById.fulfilled,
        (state, action: PayloadAction<IRestaurantFetched>) => {
          state.loading = "succeeded";
          state.selectedRestaurant = action.payload;
          state.error = null;
        }
      )
      .addCase(
        getAsyncRestaurantById.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to fetch restaurant";
        }
      )
      // Handle updateAsyncRestaurant
      .addCase(updateAsyncRestaurant.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        updateAsyncRestaurant.fulfilled,
        (state, action: PayloadAction<IRestaurantFetched>) => {
          state.loading = "succeeded";
          state.restaurants = state.restaurants.map((r) =>
            r.$id === action.payload.$id ? action.payload : r
          );
          if (state.selectedRestaurant?.$id === action.payload.$id) {
            state.selectedRestaurant = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        updateAsyncRestaurant.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to update restaurant";
        }
      )
      // Handle toggleRestaurantStatusAsync
      .addCase(toggleRestaurantStatusAsync.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        toggleRestaurantStatusAsync.fulfilled,
        (state, action: PayloadAction<IRestaurantFetched>) => {
          state.loading = "succeeded";
          state.restaurants = state.restaurants.map((r) =>
            r.$id === action.payload.$id ? action.payload : r
          );
          if (state.selectedRestaurant?.$id === action.payload.$id) {
            state.selectedRestaurant = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        toggleRestaurantStatusAsync.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to toggle restaurant status";
        }
      )
      // Handle deleteAsyncRestaurant
      .addCase(deleteAsyncRestaurant.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        deleteAsyncRestaurant.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = "succeeded";
          state.restaurants = state.restaurants.filter(
            (r) => r.$id !== action.payload
          );
          if (state.selectedRestaurant?.$id === action.payload) {
            state.selectedRestaurant = null;
          }
          state.error = null;
        }
      )
      .addCase(
        deleteAsyncRestaurant.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to delete restaurant";
        }
      );
  },
});

export default restaurantSlice.reducer;
