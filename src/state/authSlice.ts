import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { account, validateEnv } from "@/utils/appwrite";
import toast from "react-hot-toast";
import { AuthState, IUser, IUserFectched } from "../../types/types";
import { databases } from "@/utils/appwrite";
import { generate } from "randomstring";

const initialState: AuthState = {
  user: null,
  loading: "idle",
  error: null,
};

// Helper function to safely access localStorage
const getLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error);
      return null;
    }
  }
  return null;
};

const setLocalStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
    }
  }
};

const removeLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  }
};

// Async thunk to log in user
export const loginAsync = createAsyncThunk<
  IUser,
  { email: string; password: string; rememberMe: boolean },
  { rejectValue: string }
>(
  "auth/login",
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      // Set session persistence based on rememberMe
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      const { databaseId, userCollectionId } = validateEnv();

      const userDoc = await databases.getDocument<IUserFectched>(
        databaseId,
        userCollectionId,
        user.$id
      );

      const isAdmin = userDoc.isAdmin;
      if (isAdmin) {
        // Generate 6-digit verification code
        const verificationCode = generate({
          length: 6,
          charset: "numeric",
        });

        // Set expiration (10 minutes from now)
        const codeExpiration = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // Store code and expiration in Appwrite
        await databases.updateDocument(
          databaseId,
          userCollectionId,
          user.$id,
          {
            verificationCode,
            codeExpiration,
          }
        );

        // Call API to send verification code
        const response = await fetch("/api/admin/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: verificationCode }),
        });

        if (!response.ok) {
          throw new Error("Failed to send verification code.");
        }

        // Delete session until code is verified
        await account.deleteSession("current");
        toast.success(
        "Verification code sent to your email. Please verify to log in.",
        {
          icon: "🔒",
          duration: Infinity,
        }
        );  
        return {
          userId: user.$id,
          username: user.name,
          email: user.email,
          role: "admin",
          phoneNumber: userDoc.phone,
          phoneVerified: userDoc.phoneVerified,
          isAdmin: true,
          code:verificationCode,
        } as IUser;
      }

      // Non-admin user, proceed with login
      let phoneNumber: string | undefined;
      let phoneVerified: boolean | undefined;

      const phoneData = getLocalStorage("userPhoneData");

      if (phoneData) {
        const parsed = JSON.parse(phoneData);
        phoneNumber = parsed.phoneNumber;
        phoneVerified = parsed.verified;
      }

      return {
        userId: user.$id,
        username: user.name,
        email: user.email,
        role: userDoc.isVendor ? "vendor" : "user",
        phoneNumber: user.phone || phoneNumber,
        phoneVerified,
      } as IUser;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
          await account.deleteSession("current");
      return rejectWithValue(message);
    }
  }
);

// Async thunk to log in as guest
export const loginAsGuestAsync = createAsyncThunk<
  IUser,
  void,
  { rejectValue: string }
>("auth/loginAsGuest", async (_, { rejectWithValue }) => {
  try {
    // Get guest user data from localStorage (set by the modal)
    const guestData = getLocalStorage("guestUserData");

    if (guestData) {
      const guestUser = JSON.parse(guestData);
      toast.success("Logged in as guest! You can browse and order food.");
      return guestUser as IUser;
    } else {
      // Fallback for direct guest login (without phone)
      const guestUser: IUser = {
        userId: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        username: "Guest User",
        email: `guest_${Date.now()}@guest.com`,
        role: "user",
        phoneNumber: undefined,
        phoneVerified: false,
      };

      setLocalStorage("guestUserData", JSON.stringify(guestUser));
      toast.success(
        "Logged in as guest! You can browse and order food but you have to login to book an order."
      );
      return guestUser;
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Guest login failed. Please try again.";
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Async thunk to log out user
export const logoutAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    // Clear guest user data if exists
    removeLocalStorage("guestUserData");

    // Try to delete Appwrite session if user was authenticated
    try {
      await account.deleteSession("current");
    } catch (error) {
      // Session might not exist for guest users, which is fine
      console.log("No session to delete (guest user)");
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Logout failed. Please try again.";
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Async thunk to fetch current user
export const getCurrentUserAsync = createAsyncThunk<
  IUser | null,
  void,
  { rejectValue: string }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    // First check if there's a guest user in localStorage
    const guestData = getLocalStorage("guestUserData");
    if (guestData) {
      const guestUser = JSON.parse(guestData);
      return guestUser;
    }

    // If no guest user, try to get authenticated user from Appwrite
    const user = await account.get();

    // Fetch user document from users collection to get isAdmin
    const { databaseId, userCollectionId } = validateEnv();
    let isAdmin = false;
    let role:"admin" | "user" | "vendor" = "user";
    let phoneNumber: string | undefined;
    let phoneVerified: boolean | undefined;
    let fullName: string;


    try {
      const userDoc:IUserFectched = await databases.getDocument(
        databaseId,
        userCollectionId,
        user.$id
      );
      isAdmin = userDoc.isAdmin ?? false;
      role = isAdmin ? "admin" : userDoc.isVendor ? "vendor" :"user";
      phoneNumber = userDoc.phone
      fullName = userDoc.fullName || "";
    } catch (err) {
      // If user doc not found or isAdmin missing, default to false
      isAdmin = false;
    }

    const phoneData = getLocalStorage("userPhoneData");

    if (phoneData) {
      const parsed = JSON.parse(phoneData);
      phoneNumber = parsed.phoneNumber;
      phoneVerified = parsed.verified;
    }
    return {
      userId: user.$id,
      username: user.name,
      email: user.email,
      role,
      isAdmin,
      phoneNumber: user.phone || phoneNumber,
      phoneVerified,
    };
  } catch (error) {
    // No user logged in, return null
    return null;
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(
        loginAsync.rejected,
        (state, action) => {
          state.loading = "failed";
          state.error = action.payload || "Login failed";
        }
      )
      .addCase(loginAsGuestAsync.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(loginAsGuestAsync.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(
        loginAsGuestAsync.rejected,
        (state, action) => {
          state.loading = "failed";
          state.error = action.payload || "Guest login failed";
        }
      )
      .addCase(logoutAsync.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = "succeeded";
        state.user = null;
        state.error = null;
      })
      .addCase(
        logoutAsync.rejected,
        (state, action) => {
          state.loading = "failed";
          state.error = action.payload || "Logout failed";
        }
      )
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action: PayloadAction<IUser | null>) => {
        state.loading = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(
        getCurrentUserAsync.rejected,
        (state, action) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to get current user";
        }
      );
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
