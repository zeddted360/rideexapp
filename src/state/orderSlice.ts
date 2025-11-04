import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICartItemFetched, ICartItemOrder } from "../../types/types";
import { databases, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";

interface IOrderState {
  orders: ICartItemFetched[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: IOrderState = {
  orders: null,
  loading: false,
  error: null,
};

// Create order with optimistic update support
export const createOrderAsync = createAsyncThunk<
  ICartItemFetched,
  ICartItemOrder,
  { rejectValue: { error: string; tempId: string } }
>("orders/createOrder", async (orderData, { rejectWithValue }) => {
  try {
    const { databaseId, orderId } = validateEnv();
    const { $id, ...data } = orderData as ICartItemOrder & { $id?: string }; 

    
    const response = await databases.createDocument(
      databaseId,
      orderId,
      ID.unique(),
      data
    );
    return response as ICartItemFetched;
  } catch (error) {
    console.log(error);
    return rejectWithValue({
      error: error instanceof Error ? error.message : "Failed to create order",
      tempId: (orderData as ICartItemOrder & { $id?: string }).$id || "",
    });
  }
});

// Fetch orders by userId
export const fetchOrdersByUserIdAsync = createAsyncThunk<
  ICartItemFetched[],
  string,
  { rejectValue: string }
>("orders/fetchOrdersByUserId", async (userId, { rejectWithValue }) => {
  try {
    const { databaseId, orderId } = validateEnv();
    const response = await databases.listDocuments(databaseId, orderId, [
      Query.equal("userId", userId),
    ]);
    return response.documents as ICartItemFetched[];
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch orders"
    );
  }
});

// Delete order
export const deleteOrderAsync = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("orders/deleteOrder", async (orderId, { rejectWithValue }) => {
  try {
    const { databaseId, orderId: collectionId } = validateEnv();
    await databases.deleteDocument(databaseId, collectionId, orderId);
    return orderId;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to delete order"
    );
  }
});

// Update order
export const updateOrderAsync = createAsyncThunk<
  ICartItemFetched,
  { orderId: string; orderData: Partial<ICartItemOrder> },
  { rejectValue: string }
>("orders/updateOrder", async ({ orderId, orderData }, { rejectWithValue }) => {
  try {
    const { databaseId, orderId: collectionId } = validateEnv();
    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      orderId,
      orderData
    );
    return response as ICartItemFetched;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to update order"
    );
  }
});

// Order slice
export const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // Reset orders state
    resetOrders(state) {
      state.orders = null;
      state.loading = false;
      state.error = null;
    },
    // Optimistic update for quantity
    updateQuantity(
      state,
      action: PayloadAction<{ orderId: string; change: number }>
    ) {
      if (state.orders) {
        state.orders = state.orders
          .map((order) => {
            if (order.$id === action.payload.orderId) {
              const newQuantity = Math.max(
                0,
                order.quantity + action.payload.change
              );
              const price =
                typeof order.price === "string"
                  ? Number(order.price.replace(/[₦,]/g, ""))
                  : order.price;
              return {
                ...order,
                quantity: newQuantity,
                totalPrice: price * newQuantity,
              };
            }
            return order;
          })
          .filter((order) => order.quantity > 0); // Remove if quantity is 0
      }
    },
    // Optimistic delete
    deleteOrder(state, action: PayloadAction<string>) {
      if (state.orders) {
        state.orders = state.orders.filter(
          (order) => order.$id !== action.payload
        );
      }
    },
    // Optimistic add order or update quantity if item exists
    addOrder(state, action: PayloadAction<ICartItemFetched>) {
      if (state.orders) {
        const existingOrder = state.orders.find(
          (order) =>
            order.itemId === action.payload.itemId &&
            order.userId === action.payload.userId
        );
        if (existingOrder) {
          // Update quantity and totalPrice if item exists
          state.orders = state.orders.map((order) =>
            order.$id === existingOrder.$id
              ? {
                  ...order,
                  quantity: order.quantity + action.payload.quantity,
                  totalPrice:
                    (typeof order.price === "string"
                      ? Number(order.price.replace(/[₦,]/g, ""))
                      : order.price) *
                    (order.quantity + action.payload.quantity),
                  specialInstructions:
                    action.payload.specialInstructions ||
                    order.specialInstructions,
                }
              : order
          );
        } else {
          // Add new item if it doesn't exist
          state.orders = [...state.orders, action.payload];
        }
      } else {
        state.orders = [action.payload];
      }
    },
  },
  extraReducers(builder) {
    builder
      // Create order
      .addCase(createOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createOrderAsync.fulfilled,
        (state, action: PayloadAction<ICartItemFetched>) => {
          state.loading = false;
          state.error = null;
          if (state.orders) {
            // Check if an optimistic order exists with the same itemId and userId
            const optimisticOrder = state.orders.find(
              (order) =>
                order.itemId === action.payload.itemId &&
                order.userId === action.payload.userId &&
                order.$id.startsWith("temp-")
            );
            if (optimisticOrder) {
              // Replace the optimistic order with the server response
              state.orders = state.orders.map((order) =>
                order.$id === optimisticOrder.$id ? action.payload : order
              );
            } else {
              // If no optimistic order exists (edge case), check for duplicates
              const existingOrder = state.orders.find(
                (order) =>
                  order.itemId === action.payload.itemId &&
                  order.userId === action.payload.userId
              );
              if (!existingOrder) {
                state.orders.push(action.payload);
              }
            }
          } else {
            state.orders = [action.payload];
          }
        }
      )
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || "Failed to create order";
        // Remove the optimistically added order using tempId
        if (state.orders && action.payload?.tempId) {
          state.orders = state.orders.filter(
            (order) => order.$id !== action.payload?.tempId
          );
        }
      })
      // Fetch orders by userId
      .addCase(fetchOrdersByUserIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrdersByUserIdAsync.fulfilled,
        (state, action: PayloadAction<ICartItemFetched[]>) => {
          state.loading = false;
          state.error = null;
          state.orders = action.payload;
        }
      )
      .addCase(fetchOrdersByUserIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      })
      // Delete order
      .addCase(deleteOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteOrderAsync.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = null;
          if (state.orders) {
            state.orders = state.orders.filter(
              (order) => order.$id !== action.payload
            );
          }
        }
      )
      .addCase(deleteOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete order";
      })
      // Update order
      .addCase(updateOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateOrderAsync.fulfilled,
        (state, action: PayloadAction<ICartItemFetched>) => {
          state.loading = false;
          state.error = null;
          if (state.orders) {
            state.orders = state.orders.map((order) =>
              order.$id === action.payload.$id ? action.payload : order
            );
          } else {
            state.orders = [action.payload];
          }
        }
      )
      .addCase(updateOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update order";
      });
  },
});

// Export actions
export const { resetOrders, updateQuantity, deleteOrder, addOrder } =
  orderSlice.actions;

// Export reducer
export default orderSlice.reducer;
