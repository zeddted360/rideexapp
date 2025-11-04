// components/Login.tsx
"use client";
import { useDispatch, useSelector } from "react-redux";
import {
  loginAsync,
  loginAsGuestAsync,
  clearError,
  getCurrentUserAsync,
} from "@/state/authSlice";
import { RootState, AppDispatch } from "@/state/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { account, databases, validateEnv } from "@/utils/appwrite";
import { LoginFormData } from "@/utils/authSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react"; // Added useRef
import { Query } from "appwrite";
import { useAuth } from "@/context/authContext";
import { IUserFectched } from "../../types/types";
import LoginForm from "./login/LoginForm";
import ForgotPasswordButton from "./login/ForgotPasswordButton";
import ErrorDisplay from "./login/ErrorDisplay";
import GuestLoginButton from "./login/GuestLoginButton";
import PhoneModal from "./login/PhoneModal";
import VerificationModal from "./login/VerificationModal";

const Login = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [existingUser, setExistingUser] = useState<IUserFectched | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const hasRedirected = useRef(false); // Added to track redirect status

  useEffect(() => {
    // Prevent redirect if already redirected or verification modal is open
    if (hasRedirected.current || showVerificationModal || !isAuthenticated) {
      return;
    }
    // Perform redirect and mark as done
    hasRedirected.current = true;
    router.push("/");
    // Cleanup to reset the flag on component unmount
    return () => {
      hasRedirected.current = false;
    };
  }, [isAuthenticated, showVerificationModal, router]);

  const getFriendlyErrorMessage = (error: string): string => {
    const errorLower = error.toLowerCase();
    if (errorLower.includes("invalid credentials") || errorLower.includes("user not found")) {
      return "Invalid email or password. Please check your credentials.";
    }
    if (errorLower.includes("network") || errorLower.includes("fetch")) {
      console.log("The error is either network error or fetch error");
      return "Network error. Please check your internet connection.";
    }
    if (errorLower.includes("too many requests")) {
      return "Too many login attempts. Please wait a moment and try again.";
    }
    if (errorLower.includes("email")) {
      return "Please enter a valid email address.";
    }
    if (errorLower.includes("password")) {
      return "Password is required and must be at least 6 characters.";
    }
    return "Login failed. Please try again.";
  };

  const onSubmit = async (data: LoginFormData) => {
    dispatch(clearError());
    setNetworkError(false);
    setFieldErrors({});

    try {
      const result = await dispatch(loginAsync(data));
      if (loginAsync.fulfilled.match(result)) {
        if (result.payload.role === "admin") {
          setAdminEmail(data.email);
          setTempPassword(data.password);
          setShowVerificationModal(true);
          hasRedirected.current = false; // Reset redirect flag for admin flow
          return;
        } else {
          dispatch(getCurrentUserAsync());
          toast.success("Login successful!");
          setRetryCount(0);
          // Redirect handled by useEffect
        }
      } else if (loginAsync.rejected.match(result)) {
        const errorMessage = result.payload as string;
        if (
          errorMessage.toLowerCase().includes("network") ||
          errorMessage.toLowerCase().includes("fetch") ||
          errorMessage.toLowerCase().includes("connection")
        ) {
          setNetworkError(true);
        } else if (errorMessage.toLowerCase().includes("email")) {
          setFieldErrors((prev) => ({ ...prev, email: "Invalid email address" }));
        } else if (errorMessage.toLowerCase().includes("password")) {
          setFieldErrors((prev) => ({ ...prev, password: "Incorrect password" }));
        } else if (
          errorMessage.toLowerCase().includes("user not found") ||
          errorMessage.toLowerCase().includes("invalid credentials")
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            email: "Account not found",
            password: "Please check your credentials",
          }));
        }
        const friendlyMessage = getFriendlyErrorMessage(errorMessage);
        toast.error(friendlyMessage);
      }
    } catch (error) {
      setNetworkError(true);
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setNetworkError(false);
    onSubmit({
      email: "",
      password: "",
      rememberMe: false,
    });
  };

  const handleGuestLogin = () => {
    setShowPhoneModal(true);
  };

  const checkPhoneInAppwriteForGuestUser = async (phone: string) => {
    try {
      const { databaseId, userCollectionId } = validateEnv();
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+234" + formattedPhone.slice(1);
      } else if (formattedPhone.startsWith("234")) {
        formattedPhone = "+" + formattedPhone;
      } else if (!formattedPhone.startsWith("+234")) {
        formattedPhone = "+234" + formattedPhone;
      }
      const response = await databases.listDocuments(databaseId, userCollectionId, [
        Query.equal("phone", formattedPhone),
      ]);
      if (response.documents.length > 0) {
        return response.documents[0];
      }
      return null;
    } catch (error) {
      console.error("Error checking phone:", error);
      return null;
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+234" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("234")) {
      formattedPhone = "+" + formattedPhone;
    } else if (!formattedPhone.startsWith("+234")) {
      formattedPhone = "+234" + formattedPhone;
    }
    const regex = /^\+234\d{10}$/;
    if (!regex.test(formattedPhone)) {
      toast.error("Please enter a valid Nigerian phone number (e.g., 08012345678)");
      return;
    }
    setIsCheckingPhone(true);
    try {
      const existingUserData = await checkPhoneInAppwriteForGuestUser(formattedPhone);
      if (existingUserData) {
        setExistingUser(existingUserData as unknown as IUserFectched);
        toast.success(`Welcome back, ${existingUserData.name || existingUserData.username}!`);
      } else {
        setExistingUser(null);
        toast.success("Welcome! You're browsing as a guest.");
      }
      const guestUser = {
        userId: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        username: existingUserData?.name || existingUserData?.username || "Guest User",
        email: `guest_${Date.now()}@guest.com`,
        role: "user",
        phoneNumber: formattedPhone,
        phoneVerified: false,
        isGuest: true,
        existingUserData: existingUserData
          ? {
              name: existingUserData.name,
              username: existingUserData.username,
              email: existingUserData.email,
            }
          : null,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("guestUserData", JSON.stringify(guestUser));
        } catch (error) {
          console.warn("Failed to store guest user data:", error);
          toast.error("Failed to save guest data locally");
        }
      }
      const result = await dispatch(loginAsGuestAsync());
      if (loginAsGuestAsync.fulfilled.match(result)) {
        setPhoneNumber(result.payload.phoneNumber as string);
        setShowPhoneModal(false);
        toast.success("Guest login successful!");
        // Redirect handled by useEffect
      } else if (loginAsGuestAsync.rejected.match(result)) {
        const errorMessage = result.payload as string;
        toast.error(`Guest login failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Guest login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      if (
        errorMessage.toLowerCase().includes("network") ||
        errorMessage.toLowerCase().includes("fetch") ||
        errorMessage.toLowerCase().includes("connection")
      ) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Failed to create guest session. Please try again.");
      }
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = "";
    if (!email) {
      toast.error("Please enter your email to reset password");
      return;
    }
    try {
      await account.createRecovery(email, "http://localhost:3000/reset-password");
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(
        `Failed to send reset link: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleCodeVerification = async () => {
    if (!tempPassword) {
      setVerificationError("Password not available. Please try logging in again.");
      toast.error("Password not available. Please try logging in again.");
      return;
    }
    setIsVerifyingCode(true);
    setVerificationError(null);
    try {
      const { databaseId, userCollectionId } = validateEnv();
      const response = await databases.getDocument<IUserFectched>(
        databaseId,
        userCollectionId,
        user?.userId || "",
      );
      if (!response) {
        setVerificationError("User not found.");
        toast.error("User not found.");
        setIsVerifyingCode(false);
        return;
      }
      const userDoc = response;
      const storedCode = userDoc.verificationCode;
      const codeExpiration = userDoc.codeExpiration ? new Date(userDoc.codeExpiration) : null;
      if (!storedCode || !codeExpiration) {
        setVerificationError("No verification code found. Please request a new one.");
        toast.error("No verification code found. Please request a new one.");
        setIsVerifyingCode(false);
        return;
      }
      if (codeExpiration < new Date()) {
        setVerificationError("Verification code has expired. Please request a new one.");
        toast.error("Verification code has expired. Please request a new one.");
        setIsVerifyingCode(false);
        return;
      }
      if (storedCode !== verificationCode) {
        setVerificationError("Invalid verification code.");
        toast.error("Invalid verification code.");
        setIsVerifyingCode(false);
        return;
      }
      await account.createEmailPasswordSession(adminEmail, tempPassword);
      await databases.updateDocument(databaseId, userCollectionId, userDoc.$id, {
        verificationCode: null,
        codeExpiration: null,
      });
      dispatch(getCurrentUserAsync());
      toast.success("Admin login successful!", { icon: "🔓" });
      await new Promise((resolve) => setTimeout(resolve, 4000));
      toast.dismiss();
      setShowVerificationModal(false);
      setVerificationCode("");
      setTempPassword("");
      setRetryCount(0);
      // Redirect handled by useEffect
    } catch (error) {
      console.error("Error completing admin login:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setVerificationError("Failed to complete login. Please try again.");
      toast.error(`Login failed: ${getFriendlyErrorMessage(errorMessage)}`);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    setIsResendingCode(true);
    setVerificationError(null);
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiration = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { databaseId, userCollectionId } = validateEnv();
      const response = await databases.listDocuments(databaseId, userCollectionId, [
        Query.equal("email", adminEmail),
      ]);
      if (response.documents.length === 0) {
        setVerificationError("User not found.");
        toast.error("User not found.");
        setIsResendingCode(false);
        return;
      }
      const userDoc = response.documents[0] as IUserFectched;
      await databases.updateDocument(databaseId, userCollectionId, userDoc.$id, {
        verificationCode: newCode,
        codeExpiration,
      });
      const apiResponse = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, code: newCode }),
      });
      if (apiResponse.ok) {
        toast.success("Verification code resent to your email.");
        setVerificationCode("");
      } else {
        const errorData = await apiResponse.json();
        setVerificationError(errorData.error || "Failed to resend code.");
        toast.error(errorData.error || "Failed to resend code.");
      }
    } catch (error) {
      console.error("Error resending code:", error);
      setVerificationError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setIsResendingCode(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-950 dark:to-gray-900">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white dark:bg-gray-900">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <LoginForm
            onSubmit={onSubmit}
            loading={loading}
            errors={{}}
            fieldErrors={fieldErrors}
          />
          <div className="flex items-center justify-end mt-4">
            <ForgotPasswordButton onClick={handleForgotPassword} />
          </div>
          <ErrorDisplay
            networkError={networkError}
            error={error}
            retryCount={retryCount}
            onRetry={handleRetry}
            loading={loading}
            getFriendlyErrorMessage={getFriendlyErrorMessage}
          />
          <div className="relative flex items-center justify-center my-4">
            <span className="absolute w-full border-t border-gray-300 dark:border-gray-700" />
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 z-10">
              or
            </span>
          </div>
          <GuestLoginButton onClick={handleGuestLogin} loading={loading} />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      <PhoneModal
        open={showPhoneModal}
        onOpenChange={setShowPhoneModal}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        onPhoneSubmit={handlePhoneSubmit}
        isCheckingPhone={isCheckingPhone}
      />
      <VerificationModal
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        onCodeVerification={handleCodeVerification}
        onResendCode={handleResendCode}
        isVerifyingCode={isVerifyingCode}
        isResendingCode={isResendingCode}
        verificationError={verificationError}
        adminEmail={adminEmail}
      />
    </div>
  );
};

export default Login;