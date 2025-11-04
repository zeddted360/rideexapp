"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUserAsync, updateUser } from "@/state/authSlice";
import { RootState, AppDispatch } from "@/state/store";
import { IUser } from "../../types/types";

interface AuthContextType {
  userId: string | null;
  username: string | null;
  email: string | null;
  role: "admin" | "user" | "vendor" | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: IUser | null;
  code?: string | null;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  username: null,
  email: null,
  role: null,
  isAdmin: false,
  isLoading: true,
  isAuthenticated: false,
  user: null,
  code: null,
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [isMounted, setIsMounted] = useState(false); 
  // Ensure client-side rendering for async-dependent state
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Fetch user data only once on mount, or when user is null and not loading
  // Logic: If user exists and has a 'code' (pending verification), skip fetch to avoid overriding the pending state
  // Otherwise, if no user at all, fetch to check for existing session
  useEffect(() => {
    if (user && user.code) {
      // User exists but is in verification mode (e.g., admin with pending code) - skip fetch
      return;
    }
    if (!user) {
      // No user - fetch to check for existing session
      dispatch(getCurrentUserAsync());
    }
  }, [dispatch, user]); // Include loading to avoid fetching during pending state

  // Memoized context value to prevent unnecessary re-renders
  // Refined isAuthenticated: True only if user exists AND no pending code (prevents premature auth during verification)
  const contextValue = useMemo(
    () => ({
      user,
      userId: user?.userId || null,
      username: user?.username || null,
      email: user?.email || null,
      isAuthenticated: !!user && !user?.code, // Exclude pending verification
      role: user?.role || null,
      isAdmin: user?.role === "admin" || false,
      isLoading: loading === "pending",
      code: user?.code || null,
      updateUser: (userData: any) => {
        dispatch(updateUser(userData));
      },
    }),
    [user, loading, dispatch]
  );

  // Render nothing or a fallback during SSR to avoid mismatches
  if (!isMounted) {
    return (
      <AuthContext.Provider
        value={{
          userId: null,
          username: null,
          email: null,
          role: null,
          isAdmin: false,
          isLoading: true,
          isAuthenticated: false,
          user: null,
          code: null,
          updateUser: () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};