import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases, validateEnv } from "@/utils/appwrite";
import { Query } from "appwrite";
import { IBookedOrderFetched } from "../../types/types";


interface BookedOrdersState {
  orders: IBookedOrderFetched[];
  currentOrder: IBookedOrderFetched | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookedOrdersState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};
// fetch all orders 
export const fetchBookedOrders = createAsyncThunk<
  IBookedOrderFetched[],
  void,
  { rejectValue: string }
>("bookedOrders/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { databaseId, bookedOrdersCollectionId } = validateEnv();
    const response = await databases.listDocuments(
      databaseId,
      bookedOrdersCollectionId,
      [Query.orderDesc("createdAt")]
    );
    return response.documents as IBookedOrderFetched[];
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch booked orders"
    );
  }
});


// Fetch all booked orders for a user
export const fetchBookedOrdersByUserId = createAsyncThunk<
  IBookedOrderFetched[],
  string,
  { rejectValue: string }
>("bookedOrders/fetchByUserId", async (userId, { rejectWithValue }) => {
  try {
    const { databaseId, bookedOrdersCollectionId } = validateEnv();
    const response = await databases.listDocuments(databaseId, bookedOrdersCollectionId, [
      Query.equal("customerId", userId),
      Query.orderDesc("createdAt"),
    ]);
    return response.documents as IBookedOrderFetched[];
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch booked orders"
    );
  }
});

// Fetch a single booked order by orderId
export const fetchBookedOrderById = createAsyncThunk<
  IBookedOrderFetched,
  string,
  { rejectValue: string }
>("bookedOrders/fetchById", async (orderId, { rejectWithValue }) => {
  try {
    const { databaseId, bookedOrdersCollectionId } = validateEnv();
    const response = await databases.getDocument(databaseId, bookedOrdersCollectionId, orderId);
    return response as IBookedOrderFetched;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch booked order"
    );
  }
});

// Cancel (delete) a booked order
export const cancelBookedOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("bookedOrders/cancel", async (orderId, { rejectWithValue }) => {
  try {
    const { databaseId, bookedOrdersCollectionId } = validateEnv();
    await databases.deleteDocument(databaseId, bookedOrdersCollectionId, orderId);
    return orderId;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to cancel order"
    );
  }
});

// Update booked order status
export const updateBookedOrderAsync = createAsyncThunk<
  IBookedOrderFetched,
  { orderId: string; orderData: Partial<IBookedOrderFetched> },
  { rejectValue: string }
>("bookedOrders/update", async ({ orderId, orderData }, { rejectWithValue }) => {
  try {
    const { databaseId, bookedOrdersCollectionId } = validateEnv();
    const response = await databases.updateDocument(
      databaseId,
      bookedOrdersCollectionId,
      orderId,
      orderData
    );
    return response as IBookedOrderFetched;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to update booked order"
    );
  }
});

// Update booked order rider code
export const updateBookedOrderRiderCode = createAsyncThunk<
  IBookedOrderFetched,
  { id: string; riderCode: string },
  { rejectValue: string }
>("bookedOrders/updateRiderCode", async ({ id, riderCode }, { rejectWithValue }) => {
  try {
    const { databaseId, bookedOrdersCollectionId } = validateEnv();
    const response = await databases.updateDocument(
      databaseId,
      bookedOrdersCollectionId,
      id,
      { riderCode }
    );
    return response as IBookedOrderFetched;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to update rider code"
    );
  }
});

export const bookedOrdersSlice = createSlice({
  name: "bookedOrders",
  initialState,
  reducers: {
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookedOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookedOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchBookedOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch booked orders";
      })

      //
      .addCase(fetchBookedOrdersByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookedOrdersByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchBookedOrdersByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch booked orders";
      })
      .addCase(fetchBookedOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookedOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchBookedOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch booked order";
      })
      .addCase(cancelBookedOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBookedOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(
          (order) => order.$id !== action.payload
        );
        if (state.currentOrder && state.currentOrder.$id === action.payload) {
          state.currentOrder = null;
        }
        state.error = null;
      })
      .addCase(cancelBookedOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to cancel order";
      })
      .addCase(updateBookedOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookedOrderAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update the order in the orders array
        state.orders = state.orders.map((order) =>
          order.$id === action.payload.$id ? action.payload : order
        );
        // Update current order if it's the one being updated
        if (
          state.currentOrder &&
          state.currentOrder.$id === action.payload.$id
        ) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBookedOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update booked order";
      })
      .addCase(updateBookedOrderRiderCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookedOrderRiderCode.fulfilled, (state, action) => {
        state.loading = false;
        // Update the order in the orders array
        state.orders = state.orders.map((order) =>
          order.$id === action.payload.$id ? action.payload : order
        );
        // Update current order if it's the one being updated
        if (
          state.currentOrder &&
          state.currentOrder.$id === action.payload.$id
        ) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBookedOrderRiderCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update rider code";
      });
  },
});

export const { clearCurrentOrder } = bookedOrdersSlice.actions;
export default bookedOrdersSlice.reducer;