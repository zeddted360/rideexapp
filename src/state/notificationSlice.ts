import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { databases, validateEnv } from "@/utils/appwrite";
import { Query } from "appwrite";
import {
  INotification,
  INotificationFetched,
  INotificationState,
} from "../../types/types";

// Initial state
const initialState: INotificationState = {
  notifications: [],
  adminNotifications: [],
  userNotifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

// Async thunks
export const fetchAllNotifications = createAsyncThunk<INotificationFetched[]>(
  "notifications/fetchAll",
  async () => {
    const { databaseId, notificationCollectionId } = validateEnv();
    const response = await databases.listDocuments(
      databaseId,
      notificationCollectionId,
      [Query.orderDesc("createdAt"), Query.limit(100)]
    );
    return response.documents as INotificationFetched[];
  }
);

export const fetchAdminNotifications = createAsyncThunk<INotificationFetched[]>(
  "notifications/fetchAdmin",
  async () => {
    const { databaseId, notificationCollectionId } = validateEnv();
    const response = await databases.listDocuments(
      databaseId,
      notificationCollectionId,
      [
        Query.equal("recipient", "admin"),
        Query.orderDesc("createdAt"),
        Query.limit(100),
      ]
    );
    return response.documents as INotificationFetched[];
  }
);

export const fetchUserNotifications = createAsyncThunk<
  INotificationFetched[],
  string
>("notifications/fetchUser", async (userId: string) => {
  const { databaseId, notificationCollectionId } = validateEnv();
  const response = await databases.listDocuments(
    databaseId,
    notificationCollectionId,
    [
      Query.equal("recipient", userId),
      Query.orderDesc("createdAt"),
      Query.limit(100),
    ]
  );

  return response.documents as INotificationFetched[];
});

export const createNotification = createAsyncThunk<
  INotificationFetched,
  Omit<INotification, "$id" | "createdAt">
>("notifications/create", async (notification) => {
  const { databaseId, notificationCollectionId } = validateEnv();
  const response = await databases.createDocument(
    databaseId,
    notificationCollectionId,
    "unique()",
    {
      ...notification,
      createdAt: new Date().toISOString(),
    }
  );
  return response as INotificationFetched;
});

export const markNotificationAsRead = createAsyncThunk<
  INotificationFetched,
  string
>("notifications/markAsRead", async (notificationId: string) => {
  const { databaseId, notificationCollectionId } = validateEnv();
  const response = await databases.updateDocument(
    databaseId,
    notificationCollectionId,
    notificationId,
    {
      status: "read",
    }
  );
  return response as INotificationFetched;
});

export const markAllNotificationsAsRead = createAsyncThunk<string, string>(
  "notifications/markAllAsRead",
  async (recipient: string) => {
    const { databaseId, notificationCollectionId } = validateEnv();
    const notifications = await databases.listDocuments(
      databaseId,
      notificationCollectionId,
      [Query.equal("recipient", recipient), Query.equal("status", "unread")]
    );

    const updatePromises = notifications.documents.map((notification) =>
      databases.updateDocument(
        databaseId,
        notificationCollectionId,
        notification.$id,
        { status: "read" }
      )
    );

    await Promise.all(updatePromises);
    return recipient;
  }
);

export const deleteNotification = createAsyncThunk<string, string>(
  "notifications/delete",
  async (notificationId: string) => {
    const { databaseId, notificationCollectionId } = validateEnv();
    await databases.deleteDocument(
      databaseId,
      notificationCollectionId,
      notificationId
    );
    return notificationId;
  }
);

export const deleteAllNotifications = createAsyncThunk<void, string>(
  "notifications/deleteAll",
  async (recipient: string) => {
    const { databaseId, notificationCollectionId } = validateEnv();
    const notifications = await databases.listDocuments(
      databaseId,
      notificationCollectionId,
      [Query.equal("recipient", recipient)]
    );

    const deletePromises = notifications.documents.map((notification) =>
      databases.deleteDocument(
        databaseId,
        notificationCollectionId,
        notification.$id
      )
    );

    await Promise.all(deletePromises);
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.adminNotifications = [];
      state.userNotifications = [];
      state.unreadCount = 0;
    },
    addNotification: (state, action: PayloadAction<INotificationFetched>) => {
      state.notifications.unshift(action.payload);
      if (action.payload.recipient === "admin") {
        state.adminNotifications.unshift(action.payload);
      } else {
        state.userNotifications.unshift(action.payload);
      }
      if (action.payload.status === "unread") {
        state.unreadCount += 1;
      }
    },
    updateNotification: (
      state,
      action: PayloadAction<INotificationFetched>
    ) => {
      const index = state.notifications.findIndex(
        (n) => n.$id === action.payload.$id
      );
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }

      const adminIndex = state.adminNotifications.findIndex(
        (n) => n.$id === action.payload.$id
      );
      if (adminIndex !== -1) {
        state.adminNotifications[adminIndex] = action.payload;
      }

      const userIndex = state.userNotifications.findIndex(
        (n) => n.$id === action.payload.$id
      );
      if (userIndex !== -1) {
        state.userNotifications[userIndex] = action.payload;
      }

      // Update unread count
      state.unreadCount = state.notifications.filter(
        (n) => n.status === "unread"
      ).length;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.$id !== action.payload
      );
      state.adminNotifications = state.adminNotifications.filter(
        (n) => n.$id !== action.payload
      );
      state.userNotifications = state.userNotifications.filter(
        (n) => n.$id !== action.payload
      );
      state.unreadCount = state.notifications.filter(
        (n) => n.status === "unread"
      ).length;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all notifications
    builder
      .addCase(fetchAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(
          (n) => n.status === "unread"
        ).length;
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      });

    // Fetch admin notifications
    builder
      .addCase(fetchAdminNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.adminNotifications = action.payload;
      })
      .addCase(fetchAdminNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch admin notifications";
      });

    // Fetch user notifications
    builder
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.userNotifications = action.payload;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch user notifications";
      });

    // Create notification
    builder.addCase(createNotification.fulfilled, (state, action) => {
      state.notifications.unshift(action.payload);
      if (action.payload.recipient === "admin") {
        state.adminNotifications.unshift(action.payload);
      } else {
        state.userNotifications.unshift(action.payload);
      }
      if (action.payload.status === "unread") {
        state.unreadCount += 1;
      }
    });

    // Mark as read
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const notification = action.payload;
      const index = state.notifications.findIndex(
        (n) => n.$id === notification.$id
      );
      if (index !== -1) {
        state.notifications[index] = notification;
      }

      const adminIndex = state.adminNotifications.findIndex(
        (n) => n.$id === notification.$id
      );
      if (adminIndex !== -1) {
        state.adminNotifications[adminIndex] = notification;
      }

      const userIndex = state.userNotifications.findIndex(
        (n) => n.$id === notification.$id
      );
      if (userIndex !== -1) {
        state.userNotifications[userIndex] = notification;
      }

      state.unreadCount = state.notifications.filter(
        (n) => n.status === "unread"
      ).length;
    });

    // Mark all as read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
      const recipient = action.payload;
      if (recipient === "admin") {
        state.adminNotifications.forEach((n) => {
          n.status = "read";
        });
      } else {
        state.userNotifications.forEach((n) => {
          n.status = "read";
        });
      }
      state.notifications.forEach((n) => {
        if (n.recipient === recipient) {
          n.status = "read";
        }
      });
      state.unreadCount = state.notifications.filter(
        (n) => n.status === "unread"
      ).length;
    });

    // Delete notification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(
        (n) => n.$id !== notificationId
      );
      state.adminNotifications = state.adminNotifications.filter(
        (n) => n.$id !== notificationId
      );
      state.userNotifications = state.userNotifications.filter(
        (n) => n.$id !== notificationId
      );
      state.unreadCount = state.notifications.filter(
        (n) => n.status === "unread"
      ).length;
    });

    // Delete all notifications
    builder.addCase(deleteAllNotifications.fulfilled, (state, action) => {
      const recipient = action.meta.arg;
      if (recipient === "admin") {
        state.adminNotifications = [];
      } else {
        state.userNotifications = [];
      }
      state.notifications = state.notifications.filter(
        (n) => n.recipient !== recipient
      );
      state.unreadCount = 0;
    });
  },
});

export const {
  clearNotifications,
  addNotification,
  updateNotification,
  removeNotification,
  setLoading,
  setError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
