import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Models, Query } from "appwrite";
import { databases, validateEnv } from "@/utils/appwrite";
import { IUserFectched } from "../../types/types";

interface UsersState {
  users: IUserFectched[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: "idle",
  error: null,
};

// Async thunk to fetch all users
export const listAsyncUsers = createAsyncThunk(
  "users/listAsyncUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { databaseId, userCollectionId } = validateEnv();
      const response = await databases.listDocuments(
        databaseId,
        userCollectionId,
        [Query.orderDesc("$createdAt")]
      );
      return response.documents as IUserFectched[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to block a user (update isBlocked to true)
export const blockUserAsync = createAsyncThunk(
  "users/blockUserAsync",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { databaseId, userCollectionId } = validateEnv();
      await databases.updateDocument(databaseId, userCollectionId, userId, {
        isBlocked: true,
      });
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to unblock a user (update isBlocked to false)
export const unblockUserAsync = createAsyncThunk(
  "users/unblockUserAsync",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { databaseId, userCollectionId } = validateEnv();
      await databases.updateDocument(databaseId, userCollectionId, userId, {
        isBlocked: false,
      });
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to delete a user
export const deleteUserAsync = createAsyncThunk(
  "users/deleteUserAsync",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { databaseId, userCollectionId } = validateEnv();
      await databases.deleteDocument(databaseId, userCollectionId, userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update user admin status
export const updateUserAdminAsync = createAsyncThunk(
  "users/updateUserAdminAsync",
  async (
    { userId, isAdmin }: { userId: string; isAdmin: boolean },
    { rejectWithValue }
  ) => {
    try {
      const { databaseId, userCollectionId } = validateEnv();
      await databases.updateDocument(databaseId, userCollectionId, userId, {
        isAdmin,
      });
      return { userId, isAdmin };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // List users
      .addCase(listAsyncUsers.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        listAsyncUsers.fulfilled,
        (state, action: PayloadAction<IUserFectched[]>) => {
          state.loading = "succeeded";
          state.users = action.payload;
        }
      )
      .addCase(listAsyncUsers.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // Block user
      .addCase(
        blockUserAsync.fulfilled,
        (state, action: PayloadAction<string>) => {
          const index = state.users.findIndex(
            (user) => user.$id === action.payload
          );
          if (index !== -1) {
            state.users[index].isBlocked = true;
          }
        }
      )
      .addCase(blockUserAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Unblock user
      .addCase(
        unblockUserAsync.fulfilled,
        (state, action: PayloadAction<string>) => {
          const index = state.users.findIndex(
            (user) => user.$id === action.payload
          );
          if (index !== -1) {
            state.users[index].isBlocked = false;
          }
        }
      )
      .addCase(unblockUserAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete user
      .addCase(
        deleteUserAsync.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.users = state.users.filter(
            (user) => user.$id !== action.payload
          );
        }
      )
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateUserAdminAsync.fulfilled, (state, action) => {
        const { userId, isAdmin } = action.payload;
        const index = state.users.findIndex((user) => user.$id === userId);
        if (index !== -1) {
          state.users[index].isAdmin = isAdmin;
        }
      })
      .addCase(updateUserAdminAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default usersSlice.reducer;
