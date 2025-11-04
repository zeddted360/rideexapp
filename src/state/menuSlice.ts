import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import { MenuItemFormData } from "@/utils/schema";
import { IMenuItemFetched } from "../../types/types";
import toast from "react-hot-toast";

interface IMenuItemProp {
  menuItems: IMenuItemFetched[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IMenuItemProp = {
  menuItems: [],
  loading: "idle",
  error: null,
};

// Function to create a menu
export const createAsyncMenuItem = createAsyncThunk<
  IMenuItemFetched,
  Partial<MenuItemFormData & { extras?: string[] }>, // Updated to accept extras
  { rejectValue: string }
>("menuItem/createMenuItem", async (data, { rejectWithValue }) => {
  try {
    const { databaseId, menuBucketId, menuItemsCollectionId } = validateEnv();
    if (!data.image?.[0]) throw new Error("Menu item image is required");

    const imageFile = await storage.createFile(
      menuBucketId,
      ID.unique(),
      data.image[0] as File
    );
    const createdDocument = await databases.createDocument(
      databaseId,
      menuItemsCollectionId,
      ID.unique(),
      {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        image: imageFile.$id,
        cookTime: data.cookTime,
        category: data.category,
        restaurantId: data.restaurantId,
        isApproved: false,
        extras: data.extras || [],
        needsTakeawayContainer: data.needsTakeawayContainer,
        extraPortion: data.extraPortion,
      }
    );

    toast.success("Menu item created successfully!"); // Optional: Specific success toast
    return createdDocument as IMenuItemFetched;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to create menu item";
    toast.error(
      `Failed to create menu item: ${errorMsg}. Check extras IDs if provided.`
    );
    console.log(errorMsg);
    return rejectWithValue(errorMsg);
  }
});

// Function to list menus
export const listAsyncMenusItem = createAsyncThunk<
  IMenuItemFetched[],
  void,
  { rejectValue: string }
>("menuItem/listMenuItem", async (_, { rejectWithValue }) => {
  try {
    const { databaseId, menuItemsCollectionId } = validateEnv();

    // Fetch all restaurant documents
    const response = await databases.listDocuments(
      databaseId,
      menuItemsCollectionId,
      [Query.orderDesc("$createdAt")]
    );
    return response.documents as IMenuItemFetched[];
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to load menu items";
    console.error(`Failed to fetch menu items: ${errorMsg}`);
    return rejectWithValue(errorMsg);
  }
});

// Function to update a menu item
export const updateAsyncMenuItem = createAsyncThunk<
  IMenuItemFetched,
  { itemId: string; data: Partial<MenuItemFormData & { extras?: string[] }>; newImage?: File | null },  // Updated to accept extras
  { rejectValue: string }
>("menuItem/updateMenuItem", async ({ itemId, data, newImage }, { rejectWithValue }) => {
  try {
    const { databaseId, menuItemsCollectionId, menuBucketId } = validateEnv();
    let updateData = { 
      ...data,
      extras: data.extras !== undefined ? data.extras : null,  
    };

    if (newImage) {
      // Upload new image
      const imageFile = await storage.createFile(
        menuBucketId,
        ID.unique(),
        newImage
      );
      updateData.image = imageFile.$id;
    }

    const updatedDocument = await databases.updateDocument(
      databaseId,
      menuItemsCollectionId,
      itemId,
      updateData
    );

    toast.success("Menu item updated successfully!");  // Optional: Specific success toast
    return updatedDocument as IMenuItemFetched;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to update menu item: ${errorMsg}. Check extras IDs if provided.`);
    return rejectWithValue(errorMsg);
  }
});

// Function to approve/update approval status of a menu item
export const updateApprovalAsyncMenuItem = createAsyncThunk<
  IMenuItemFetched,
  { itemId: string; isApproved: boolean },
  { rejectValue: string }
>("menuItem/updateApprovalMenuItem", async ({ itemId, isApproved }, { rejectWithValue }) => {
  try {
    const { databaseId, menuItemsCollectionId } = validateEnv();

    const updatedDocument = await databases.updateDocument(
      databaseId,
      menuItemsCollectionId,
      itemId,
      { isApproved }
    );

    const status = isApproved ? "approved" : "rejected";
    toast.success(`Menu item ${status} successfully!`);
    return updatedDocument as IMenuItemFetched;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to update menu item approval: ${errorMsg}`);
    return rejectWithValue(errorMsg);
  }
});

// Function to delete a menu item
export const deleteAsyncMenuItem = createAsyncThunk<
  string,
  { itemId: string; imageId: string },
  { rejectValue: string }
>("menuItem/deleteMenuItem", async ({ itemId, imageId }, { rejectWithValue }) => {
  try {
    const { databaseId, menuItemsCollectionId, menuBucketId } = validateEnv();

    // Delete image if exists
    if (imageId) {
      await storage.deleteFile(menuBucketId, imageId);
    }

    // Delete document
    await databases.deleteDocument(databaseId, menuItemsCollectionId, itemId);

    toast.success("Menu item deleted successfully!");  // Optional: Specific success toast
    return itemId;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to delete menu item: ${errorMsg}`);
    return rejectWithValue(errorMsg);
  }
});

export const menuSlice = createSlice({
  name: "menuItem",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAsyncMenuItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        createAsyncMenuItem.fulfilled,
        (state, action: PayloadAction<IMenuItemFetched>) => {
          state.loading = "succeeded";
          state.menuItems = [...state.menuItems, action.payload];
          state.error = null;
        }
      )
      .addCase(
        createAsyncMenuItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to create menu item";
        }
      )
      // handle list menuItems Case
      .addCase(listAsyncMenusItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        listAsyncMenusItem.fulfilled,
        (state, action: PayloadAction<IMenuItemFetched[]>) => {
          state.loading = "succeeded";
          state.menuItems = action.payload;
          state.error = null;
        }
      )
      .addCase(
        listAsyncMenusItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to fetch menu items";
        }
      )
      // Update
      .addCase(updateAsyncMenuItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        updateAsyncMenuItem.fulfilled,
        (state, action: PayloadAction<IMenuItemFetched>) => {
          state.loading = "succeeded";
          const index = state.menuItems.findIndex((item) => item.$id === action.payload.$id);
          if (index !== -1) {
            state.menuItems[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        updateAsyncMenuItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to update menu item";
        }
      )
      // Update Approval
      .addCase(updateApprovalAsyncMenuItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        updateApprovalAsyncMenuItem.fulfilled,
        (state, action: PayloadAction<IMenuItemFetched>) => {
          state.loading = "succeeded";
          const index = state.menuItems.findIndex((item) => item.$id === action.payload.$id);
          if (index !== -1) {
            state.menuItems[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        updateApprovalAsyncMenuItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to update menu item approval";
        }
      )
      // Delete
      .addCase(deleteAsyncMenuItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        deleteAsyncMenuItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = "succeeded";
          state.menuItems = state.menuItems.filter((item) => item.$id !== action.payload);
          state.error = null;
        }
      )
      .addCase(
        deleteAsyncMenuItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to delete menu item";
        }
      );
  },
});

export default menuSlice.reducer;