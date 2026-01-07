import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases, validateEnv } from "@/utils/appwrite";
import { Query } from "appwrite";
import { IBookedOrderFetched } from "../../types/types";
import {
  formatNigerianPhone,
  sendOrderFeedback,
} from "@/utils/sendSmsToNumber";

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
    const response = await databases.listDocuments(
      databaseId,
      bookedOrdersCollectionId,
      [Query.equal("customerId", userId), Query.orderDesc("createdAt")]
    );
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
    const response = await databases.getDocument(
      databaseId,
      bookedOrdersCollectionId,
      orderId
    );
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
    await databases.deleteDocument(
      databaseId,
      bookedOrdersCollectionId,
      orderId
    );
    return orderId;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to cancel order"
    );
  }
});

function get_sms_message(status: string, rider_code: string) {
  const messages: { [key: string]: string } = {
    confirmed: `Yay! 🎉 Your order #${rider_code} is confirmed. We’ve received it and the restaurant is preparing your food.🍔🍕`,
    out_for_delivery: `It’s on the way! 🚴💨 Your RideEx order #${rider_code} is out for delivery and will arrive soon.`,
    delivered: `Bon appétit! 😋 Your RideEx order #${rider_code} has been successfully delivered. Thanks for choosing RideEx`,
    cancelled: `Hey there! 👋 Your order #${rider_code} has been canceled. If you were charged, don’t worry—a refund is on the way Need help? Open the RideEx to reorder or contact support.`,
  };
  return messages[status] || null;
}

// Update booked order status

export const updateBookedOrderAsync = createAsyncThunk<
  IBookedOrderFetched,
  { orderId: string; orderData: Partial<IBookedOrderFetched> },
  { rejectValue: string }
>(
  "bookedOrders/update",
  async ({ orderId, orderData }, { rejectWithValue }) => {
    try {
      const { databaseId, bookedOrdersCollectionId } = validateEnv();

      // Update the order in Appwrite
      const response = await databases.updateDocument(
        databaseId,
        bookedOrdersCollectionId,
        orderId,
        orderData
      );

      const updatedOrder = response as IBookedOrderFetched;

      if (orderData.status && updatedOrder.phone) {
        const message = get_sms_message(
          orderData.status,
          updatedOrder.riderCode || updatedOrder.orderId.slice(-6)
        );
        if (message) {
          const smsResult = await sendOrderFeedback({
            number: formatNigerianPhone(updatedOrder.phone),
            message: message,
          });
          if (!smsResult.success) {
            console.warn(
              "Customer SMS notification failed (non-blocking)",
              smsResult
            );
          }
        } else {
          console.log(`No SMS for status: ${orderData.status}`);
        }
      }

      return updatedOrder;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update booked order"
      );
    }
  }
);
// Update booked order rider code
export const updateBookedOrderRiderCode = createAsyncThunk<
  IBookedOrderFetched,
  { id: string; riderCode: string },
  { rejectValue: string }
>(
  "bookedOrders/updateRiderCode",
  async ({ id, riderCode }, { rejectWithValue }) => {
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
  }
);

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
