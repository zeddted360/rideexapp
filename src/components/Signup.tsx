"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync, clearError } from "@/state/authSlice";
import { RootState, AppDispatch } from "@/state/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { account, databases, validateEnv } from "@/utils/appwrite";
import { getUserPhone, storeUserPhone } from "@/utils/phoneStorage";
import { generateUniqueEmail } from "@/utils/generateEmail";
import Link from "next/link";
import { SignupFormData, signupSchema } from "@/utils/authSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PhoneCollection from "./signup/PhoneCollection";
import PhoneVerification from "./signup/PhoneVerification";
import SignupForm from "./signup/SignupForm";
import { useAuth } from "@/context/authContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Constants
const TEMP_PASSWORD = "TempSignupPass123!"; // Strong temp password (generate dynamically in prod if needed)
const LOCAL_STORAGE_KEYS = {
  STEP: "signupStep",
  PHONE: "signupPhone",
  CODE: "signupCode",
  TEMP_USER_ID: "signupTempUserId", // Persist temp user ID
} as const;

type Step = "phone" | "verify" | "form";

const Signup = () => {
  const [step, setStep] = useState<Step>(() => {
  if (typeof window !== "undefined") {
    const phoneData = getUserPhone();
    if (phoneData?.verified) {
      return "form";
    }
    return (localStorage.getItem(LOCAL_STORAGE_KEYS.STEP) as Step) || "phone";
  }
  return "phone";
});
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (typeof window !== "undefined") {
      const phoneData = getUserPhone();
      if (phoneData?.verified) return phoneData.phoneNumber;
      return localStorage.getItem(LOCAL_STORAGE_KEYS.PHONE) || "";
    }
    return "";
  });
  const [phoneError, setPhoneError] = useState("");
  const [code, setCode] = useState(() => typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEYS.CODE) : null);
  const [codeError, setCodeError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem(LOCAL_STORAGE_KEYS.TEMP_USER_ID) || null;
    return null;
  });
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);
  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const phoneData = getUserPhone();
      if (phoneData?.verified) {
        setPhoneNumber(phoneData.phoneNumber);
        setStep("form");
        localStorage.setItem(LOCAL_STORAGE_KEYS.STEP, "form");
        localStorage.setItem(LOCAL_STORAGE_KEYS.PHONE, phoneData.phoneNumber);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CODE);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TEMP_USER_ID);
        return;
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.STEP, step);
      localStorage.setItem(LOCAL_STORAGE_KEYS.PHONE, phoneNumber);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CODE, code || "");
      if (tempUserId) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.TEMP_USER_ID, tempUserId);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TEMP_USER_ID);
      }
    }
  }, [step, phoneNumber, code, tempUserId]);

  // Countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Format phone number helper
  const formatPhone = useCallback((input: string): string => {
    let formatted = input.trim();
    if (formatted.startsWith("0")) {
      formatted = "+234" + formatted.slice(1);
    } else if (formatted.startsWith("234")) {
      formatted = "+" + formatted;
    } else if (!formatted.startsWith("+234")) {
      formatted = "+234" + formatted;
    }
    return formatted;
  }, []);
  // Validate phone helper
  const isValidPhone = useCallback((phone: string): boolean => {
    const formatted = formatPhone(phone);
    const regex = /^\+234\d{10}$/;
    return regex.test(formatted);
  }, [formatPhone]);
  // Handle phone submission: Create temp account
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    setIsSendingCode(true);

    const formattedPhone = formatPhone(phoneNumber);
    if (!isValidPhone(phoneNumber)) {
      setPhoneError("Please enter a valid Nigerian phone number (e.g., +2348012345678 or 08012345678)");
      setIsSendingCode(false);
      return;
    }

    setPhoneNumber(formattedPhone);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PHONE, formattedPhone);

    try {
      // 1. Generate temp email and create temp account
      if (!tempUserId) {
        const tempEmail = generateUniqueEmail();
        const user = await account.create(
          "unique()",
          tempEmail,
          TEMP_PASSWORD,
          "Temp User" // Temp name
        );
        setTempUserId(user.$id);
        localStorage.setItem(LOCAL_STORAGE_KEYS.TEMP_USER_ID, user.$id);

        // 2. Create session for temp account
        await account.createEmailPasswordSession(tempEmail, TEMP_PASSWORD);
      }

      // 3. Update phone on temp account
      await account.updatePhone(formattedPhone, TEMP_PASSWORD);

      // 4. Send verification code
      await account.createPhoneVerification();

      toast.success("Verification code sent!");
      setStep("verify");
      localStorage.setItem(LOCAL_STORAGE_KEYS.STEP, "verify");
      setResendCountdown(60);
    } catch (error: any) {
      let errorMessage = "Failed to send verification code";
      if (error.code === 409) {
        errorMessage = "This phone number is already registered. Please log in instead.";
      } else if (error.code === 400) {
        errorMessage = "Invalid phone number format. Please check and try again.";
      }
      setPhoneError(errorMessage);
      toast.error(errorMessage);
      // Cleanup on failure
      if (tempUserId) {
        try {
          await account.deleteSession("current");
          // Optionally delete the temp user via API if needed (requires server-side)
        } catch {} // Ignore cleanup errors
        setTempUserId(null);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TEMP_USER_ID);
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handle code submission: Verify phone on temp account
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError("");
    setIsVerifyingCode(true);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CODE, code || "");

    if (!code || code.length !== 6) {
      setCodeError("Please enter a valid 6-digit code");
      setIsVerifyingCode(false);
      return;
    }

    try {
      if (!tempUserId) {
        throw new Error("No active session. Please start over.");
      }
      await account.updatePhoneVerification(tempUserId, code);

      toast.success("Phone verified successfully!");
      setStep("form");
      localStorage.setItem(LOCAL_STORAGE_KEYS.STEP, "form");
      storeUserPhone(phoneNumber, true); // Mark as verified locally
    } catch (error: any) {
      let errorMessage = "Failed to verify code";
      if (error.code === 400) {
        errorMessage = "Invalid or expired code. Please try again.";
      }
      setCodeError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Handle resend code: Resend on temp account
  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    setIsSendingCode(true);
    try {
      if (!tempUserId) {
        throw new Error("No active session. Please start over.");
      }
      await account.createPhoneVerification();
      toast.success("Verification code resent successfully!");
      setResendCountdown(60);
      localStorage.setItem(LOCAL_STORAGE_KEYS.STEP, "verify");
    } catch (error: any) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handle back to previous step
  const handleBack = useCallback(() => {
    if (step === "verify") {
      setStep("phone");
      localStorage.setItem(LOCAL_STORAGE_KEYS.STEP, "phone");
    } else if (step === "form") {
      setStep("verify");
      localStorage.setItem(LOCAL_STORAGE_KEYS.STEP, "verify");
    }
  }, [step]);

  // Handle abort/cancel: Cleanup temp account
  const handleAbort = useCallback(async () => {
    if (tempUserId) {
      try {
        await account.deleteSession("current");
        // Note: Deleting the temp user requires server-side (Appwrite Function) or admin API; skip for now
      } catch (error) {
        console.warn("Cleanup failed:", error);
      }
      setTempUserId(null);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TEMP_USER_ID);
    }
    // Clear all localStorage
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    router.push("/login");
  }, [tempUserId, router]);

  // Signup form: Update temp account with real details
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const handleSignupSubmit = async (data: SignupFormData) => {
    dispatch(clearError());
    setIsSigningUp(true);
    try {
      if (!tempUserId) {
        throw new Error("No temporary account found. Please start over.");
      }
      // 1. Update name on temp account
      await account.updateName(`${data.firstName} ${data.lastName}`);
      // 2. Update email to real email (requires temp password)
      await account.updateEmail(data.email, TEMP_PASSWORD);
      // 3. Update password to new password
      await account.updatePassword(data.password, TEMP_PASSWORD);
      // 4. Create user profile in database
      const currentUser = await account.get();
      const { databaseId, userCollectionId } = validateEnv();
      await databases.createDocument(databaseId, userCollectionId, currentUser.$id, {
        userId: currentUser.$id,
        fullName: `${data.firstName} ${data.lastName}`,
        phone: phoneNumber,
        email: data.email,
      });

      // delet session then log in again
      await account.deleteSession("current");
      // 6. Refresh Redux state with login
      const loginResult = await dispatch(
        loginAsync({
          email: data.email,
          password: data.password,
          rememberMe: true,
        })
      );
      if (loginAsync.fulfilled.match(loginResult)) {
        // Phone is already verified on the account
        storeUserPhone(phoneNumber, true);
        toast.success("Account created successfully!");
        // Full cleanup
        Object.values(LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        setTempUserId(null);
        router.push("/");
      } else {
        throw new Error("Failed to log in after account update");
      }
    } catch (error: any) {
      let errorMessage = "Signup failed";
      if (error.code === 409) {
        errorMessage = "Email already in use. Please log in or use a different email.";
      } else if (error.code === 400) {
        errorMessage = "Invalid email or password format. Please check and try again.";
      }
      console.error("Signup failed:", error);
      toast.error(errorMessage);
      // On error, attempt cleanup
      handleAbort();
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-950 dark:to-gray-900">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white dark:bg-gray-900">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create Account
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join us and start ordering delicious food!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Back Button for non-phone steps */}
          {(step === "verify" || step === "form") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}

          {/* Abort Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAbort}
            className="w-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Cancel Signup
          </Button>

          {step === "phone" && (
            <PhoneCollection
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              phoneError={phoneError}
              setPhoneError={setPhoneError}
              isSendingCode={isSendingCode}
              handlePhoneSubmit={handlePhoneSubmit}
            />
          )}
          {step === "verify" && (
            <PhoneVerification
              code={code}
              setCode={setCode}
              codeError={codeError}
              setCodeError={setCodeError}
              isVerifyingCode={isVerifyingCode}
              handleCodeSubmit={handleCodeSubmit}
              handleResendCode={handleResendCode}
              isSendingCode={isSendingCode}
              resendCountdown={resendCountdown}
            />
          )}
          {step === "form" && (
            <SignupForm
              signupForm={signupForm}
              handleSignupSubmit={handleSignupSubmit}
              phoneNumber={phoneNumber}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              error={error || ""}
              loading={loading}
              isSigningUp={isSigningUp}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;