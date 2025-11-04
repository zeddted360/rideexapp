"use client";
import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Edit, 
  Check, 
  Loader2,
  Shield,
  Smartphone,
  Settings,
  LogOut,
  UserCircle,
  History,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/authContext";
import { account, databases, validateEnv } from "@/utils/appwrite";
import { storeUserPhone, getUserPhone } from "@/utils/phoneStorage";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { getCurrentUserAsync, logoutAsync } from "@/state/authSlice";
import { useRouter } from "next/navigation";

interface ProfileDropdownProps {
  children: React.ReactNode;
}

interface UpdateFormData {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const VERIFY_EMAIL_URL = 'http://localhost:3000/verify-email'; // Update to your production URL when deploying

const ProfileDropdown = ({ children }: ProfileDropdownProps) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [emailResendCountdown, setEmailResendCountdown] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<UpdateFormData>({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPhone, setOldPhone] = useState("");
  const [oldEmail, setOldEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [phoneVerifiedSuccess, setPhoneVerifiedSuccess] = useState(false);
  const [tempCurrentPasswordForEmail, setTempCurrentPasswordForEmail] = useState("");
  const [verifyEmailUrl, setVerifyEmailUrl] = useState<string>('');

  const safeUser = user
    ? {
        name: typeof user?.username === "string" ? user.username : "",
        email: typeof user?.email === "string" ? user.email : "",
        phoneNumber:
          typeof user?.phoneNumber === "string" ? user.phoneNumber : "",
        phoneVerified:
          typeof user?.phoneVerified === "boolean" ? user.phoneVerified : false,
        userId: user?.userId || "",
        existingUserData: (user as any)?.existingUserData || null,
        isGuest: (user as any)?.isGuest || false,
      }
    : null;

  const isGuestUser = safeUser?.email?.includes('@guest.com') || safeUser?.userId?.startsWith('guest_');
  const hasExistingAccount = safeUser?.existingUserData || (isGuestUser && safeUser?.phoneNumber);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      if (host) {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        setVerifyEmailUrl(`${protocol}://${host}/verify-email`);
      } else {
        setVerifyEmailUrl(process.env.NODE_ENV === 'production' ? 'https://yourapp.com/verify-email' : 'http://localhost:3000/verify-email');
      }
    }
  }, []);

  useEffect(() => {
    if (user && isAuthenticated) {
      const userPhoneData = getUserPhone();
      const userPhone = userPhoneData?.phoneNumber || user.phoneNumber || "";
      setFormData({
        name: user.username || "",
        email: user.email || "",
        phone: userPhone,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  useEffect(() => {
    if (emailResendCountdown > 0) {
      const timer = setTimeout(() => setEmailResendCountdown(emailResendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailResendCountdown]);

  const revertPhoneUpdate = async () => {
    if (oldPhone && tempPassword) {
      try {
        await account.updatePhone(oldPhone, tempPassword);
        console.log("Phone reverted to previous number");
      } catch (error: any) {
        console.error("Failed to revert phone update:", error.message);
        toast.error("Failed to revert phone update. Please contact support.");
      }
    }
    setOldPhone("");
    setTempPassword("");
    setPhoneVerifiedSuccess(false);
  };

  const revertEmailUpdate = async () => {
    if (oldEmail && tempCurrentPasswordForEmail) {
      try {
        await account.updateEmail(oldEmail, tempCurrentPasswordForEmail);
        console.log("Email reverted to previous address");
      } catch (error: any) {
        console.error("Failed to revert email update:", error.message);
        toast.error("Failed to revert email update. Please contact support.");
      }
    }
    setOldEmail("");
    setTempCurrentPasswordForEmail("");
  };

  const validateField = (field: keyof UpdateFormData, value: string): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) return "Name cannot be empty";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return null;
      case 'email':
        if (!value.trim()) return "Email cannot be empty";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
        return null;
      case 'phone':
        if (!value.trim()) return "Phone number cannot be empty";
        let formatted = value.trim();
        if (formatted.startsWith("0")) formatted = "+234" + formatted.slice(1);
        else if (formatted.startsWith("234")) formatted = "+" + formatted;
        else if (!formatted.startsWith("+234")) formatted = "+234" + formatted;
        if (!/^\+234\d{10}$/.test(formatted)) return "Please enter a valid Nigerian phone number";
        return null;
      case 'currentPassword':
        if (!value) return "Current password is required";
        return null;
      case 'newPassword':
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return null;
      case 'confirmPassword':
        if (value !== formData.newPassword) return "Passwords do not match";
        return null;
      default:
        return null;
    }
  };

  const handleInputChange = (field: keyof UpdateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const startEditing = (field: string) => {
    setEditingField(field);
    setShowEditDialog(true);
    setValidationErrors({});
  };


  const cancelEditing = () => {
    setEditingField(null);
    setShowEditDialog(false);
    setValidationErrors({});
    if (user) {
      const userPhoneData = getUserPhone();
      const userPhone = userPhoneData?.phoneNumber || user.phoneNumber || "";
      setFormData((prev) => ({
        ...prev,
        name: user.username || "",
        email: user.email || "",
        phone: userPhone,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleUpdateName = async () => {
    const error = validateField('name', formData.name);
    if (error) {
      setValidationErrors({ name: error });
      toast.error(error);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedName = await account.updateName(formData.name);
      if (safeUser) {
        updateUser({ ...safeUser, name: updatedName.name });
      }
      await databases.updateDocument(
        validateEnv().databaseId,
        validateEnv().userCollectionId,
        updatedName.$id,
        { fullName: updatedName.name }
      );
      if(user?.role === "vendor") {
        await databases.updateDocument(
          validateEnv().databaseId,
          validateEnv().vendorsCollectionId,
          user.userId,
          {
            fullName:updatedName.name
          }
        )
      }
      dispatch(getCurrentUserAsync());
      toast.success("Name updated successfully!");
      setEditingField(null);
      setShowEditDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update name");
      console.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEmail = async () => {
    const errors: ValidationErrors = {};
    const emailError = validateField('email', formData.email);
    if (emailError) errors.email = emailError;
    const passwordError = validateField('currentPassword', formData.currentPassword);
    if (passwordError) errors.currentPassword = passwordError;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the errors before continuing");
      return;
    }

    const currentEmail = safeUser?.email || "";
    if (formData.email === currentEmail) {
      toast.error("New email must be different from current one");
      return;
    }

    setIsUpdating(true);
    try {
      setOldEmail(currentEmail);
      setTempCurrentPasswordForEmail(formData.currentPassword);

      // Initiate email update
     const updatedEmail = await account.updateEmail(formData.email, formData.currentPassword);

       if(user?.role === "vendor") {
        await databases.updateDocument(
          validateEnv().databaseId,
          validateEnv().vendorsCollectionId,
          user.userId,
          {
            email:updatedEmail.email
          }
        )
      }
      
      // Send verification link to new email
      await account.createVerification(verifyEmailUrl);
      
      setShowEmailVerification(true);
      setEmailResendCountdown(60);
      setShowEditDialog(false);
      toast.success("Verification link sent to your new email! Check inbox/spam/junk folder.");
    } catch (error: any) {
      if (error.message?.includes("target with the same ID already exists")) {
        toast.error("This email is already in use. Try a different one or check if it's linked to another account.");
      } else {
        toast.error(error.message || "Failed to initiate email update");
      }
      setOldEmail("");
      setTempCurrentPasswordForEmail("");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendEmailLink = async () => {
    if (emailResendCountdown > 0) return;

    setIsSendingCode(true);
    try {
      await account.createVerification(verifyEmailUrl);
      toast.success("Verification link resent! Check inbox/spam/junk.");
      setEmailResendCountdown(60);
    } catch (error: any) {
      if (error.message?.includes("target with the same ID already exists")) {
        toast.error("Cannot resend: Email already targeted. Wait 10 mins or try a different email.");
      } else {
        toast.error(error.message || "Failed to resend link");
      }
      console.error(error);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleUpdatePhone = async () => {
    const errors: ValidationErrors = {};
    const phoneError = validateField('phone', formData.phone);
    if (phoneError) errors.phone = phoneError;
    const passwordError = validateField('currentPassword', formData.currentPassword);
    if (passwordError) errors.currentPassword = passwordError;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the errors before continuing");
      return;
    }

    let formattedPhone = formData.phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+234" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("234")) {
      formattedPhone = "+" + formattedPhone;
    } else if (!formattedPhone.startsWith("+234")) {
      formattedPhone = "+234" + formattedPhone;
    }

    const currentPhone = safeUser?.phoneNumber || getUserPhone()?.phoneNumber || "";
    if (formattedPhone === currentPhone) {
      toast.error("New phone number must be different from current one");
      return;
    }

    setIsUpdating(true);
    try {
      setOldPhone(currentPhone);
      setTempPassword(formData.currentPassword);
      setPhoneVerifiedSuccess(false);
      //Temporarily update the phone number to send OTP
      const updatedPhone = await account.updatePhone(formattedPhone, formData.currentPassword);
       if(user?.role === "vendor") {
        await databases.updateDocument(
          validateEnv().databaseId,
          validateEnv().vendorsCollectionId,
          user.userId,
          {
            phoneNumber:updatedPhone.phone
          }
        )
      }
      // Send verification code
      await account.createPhoneVerification();
      
      setFormData((prev) => ({ ...prev, phone: formattedPhone }));
      
      setShowPhoneVerification(true);
      setResendCountdown(60);
      setShowEditDialog(false);
      toast.success("Verification code sent to your new phone!");
    } catch (error: any) {
      setOldPhone("");
      setTempPassword("");
      toast.error(error.message || "Failed to initiate phone update");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setIsVerifyingCode(true);
    try {
      if(!safeUser) {
        throw new Error("Error during phone verification, user not found");
      } 
      await account.updatePhoneVerification(safeUser.userId, verificationCode);
      
      if (safeUser?.userId) {
        storeUserPhone(formData.phone, true);
      }
      if (safeUser) {
        updateUser({
          ...safeUser,
          phoneNumber: formData.phone,
          phoneVerified: true,
        });
      }
      await databases.updateDocument(
        validateEnv().databaseId,
        validateEnv().userCollectionId,
        safeUser.userId,
        { phone: formData.phone }
      );
      dispatch(getCurrentUserAsync());
      toast.success("Phone number updated successfully!");
      setPhoneVerifiedSuccess(true);
      setShowPhoneVerification(false);
      setEditingField(null);
      setVerificationCode("");
      setOldPhone("");
      setTempPassword("");
    } catch (error: any) {
      await revertPhoneUpdate();
      toast.error(error.message || "Invalid verification code");
      console.error(error);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;

    setIsSendingCode(true);
    try {
      await account.createPhoneVerification();
      toast.success("Verification code resent!");
      setResendCountdown(60);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code");
      console.error(error);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleUpdatePassword = async () => {
    const errors: ValidationErrors = {};
    
    if (!formData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    
    const newPasswordError = validateField('newPassword', formData.newPassword);
    if (newPasswordError) errors.newPassword = newPasswordError;
    
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the errors before continuing");
      return;
    }

    setIsUpdating(true);
    try {
      await account.updatePassword(formData.newPassword, formData.currentPassword);
      toast.success("Password updated successfully!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setEditingField(null);
      setShowEditDialog(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
      console.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleCreateAccount = () => {
    router.push("/signup");
  };

  const handlePhoneVerificationClose = (open: boolean) => {
    if (!open && !phoneVerifiedSuccess) {
      revertPhoneUpdate();
    }
    setShowPhoneVerification(open);
  };

  const handleEmailVerificationClose = (open: boolean) => {
    if (!open) {
      revertEmailUpdate();
    }
    setShowEmailVerification(open);
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-0" align="end">
          {/* Profile Header - Enhanced */}
          <div className="p-5 bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 border-b">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {isGuestUser && hasExistingAccount
                      ? safeUser?.existingUserData?.name || safeUser?.name
                      : safeUser?.name || "User"}
                  </h3>
                  {isGuestUser && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs px-2 py-0">
                      Guest
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {isGuestUser && hasExistingAccount
                    ? "Guest session - existing account"
                    : safeUser?.email || "No email"}
                </p>
                {safeUser?.phoneNumber && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {safeUser.phoneNumber}
                    </span>
                    {safeUser.phoneVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="p-2">
            {isGuestUser ? (
              <DropdownMenuItem
                onClick={handleCreateAccount}
                className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Create Account</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Sign up for a new account
                  </div>
                </div>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => startEditing("name")}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Edit Name</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {safeUser?.name || "Not set"}
                    </div>
                  </div>
                  <Edit className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => startEditing("email")}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Edit Email</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {safeUser?.email || "Not set"}
                    </div>
                  </div>
                  <Edit className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => startEditing("phone")}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Edit Phone</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {safeUser?.phoneNumber || "Not set"}
                    </div>
                  </div>
                  <Edit className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => startEditing("password")}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                    <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Change Password</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Update your password
                    </div>
                  </div>
                  <Edit className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="my-2" />

            {/* Navigation Items */}
            <DropdownMenuItem
              onClick={() => router.push("/myorders")}
              className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">My Orders</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  View your order history
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/history")}
              className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="w-9 h-9 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">History</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  View notifications and activity
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/address")}
              className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="w-9 h-9 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">My Addresses</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Manage delivery addresses
                </div>
              </div>
            </DropdownMenuItem>

            {user?.isAdmin && (
              <>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  onClick={() => router.push("/admin/orders")}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                >
                  <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Admin Dashboard</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Manage orders and system
                    </div>
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Logout */}
          <div className="p-2">
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            >
              <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="font-medium text-red-600 dark:text-red-400">Logout</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog - Enhanced */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {editingField === "name" && <User className="w-5 h-5 text-orange-600" />}
              {editingField === "email" && <Mail className="w-5 h-5 text-orange-600" />}
              {editingField === "phone" && <Phone className="w-5 h-5 text-orange-600" />}
              {editingField === "password" && <Lock className="w-5 h-5 text-orange-600" />}
              Edit {editingField?.charAt(0).toUpperCase() as string + editingField?.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Update your {editingField} information securely
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {(editingField === "email" || editingField === "phone") && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    placeholder="Enter current password"
                    className={`pr-10 ${validationErrors.currentPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {validationErrors.currentPassword && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.currentPassword}</span>
                  </div>
                )}
              </div>
            )}

            {editingField === "name" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={validationErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {validationErrors.name && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.name}</span>
                  </div>
                )}
              </div>
            )}

            {editingField === "email" && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className={validationErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {validationErrors.email && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.email}</span>
                  </div>
                )}
                <span className="text-xs text-gray-500 block">You'll need to verify your new email address</span>
              </div>
            )}

            {editingField === "phone" && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+2348012345678"
                  className={validationErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {validationErrors.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.phone}</span>
                  </div>
                )}
                <span className="text-xs text-gray-500 block">Format: +234 followed by 10 digits</span>
              </div>
            )}

            {editingField === "password" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                      placeholder="Enter current password"
                      className={`pr-10 ${validationErrors.currentPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {validationErrors.currentPassword && (
                    <div className="flex items-center gap-1.5 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.currentPassword}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                      className={`pr-10 ${validationErrors.newPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {validationErrors.newPassword && (
                    <div className="flex items-center gap-1.5 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.newPassword}</span>
                    </div>
                  )}
                  {!validationErrors.newPassword && formData.newPassword && formData.newPassword.length < 8 && (
                    <div className="flex items-center gap-1.5 text-sm text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formData.newPassword.length}/8 characters minimum</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                      className={`pr-10 ${validationErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <div className="flex items-center gap-1.5 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.confirmPassword}</span>
                    </div>
                  )}
                  {!validationErrors.confirmPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                    <div className="flex items-center gap-1.5 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Passwords match</span>
                    </div>
                  )}
                </div>
              </div>
            )}
  </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelEditing} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              onClick={
                editingField === "name"
                  ? handleUpdateName
                  : editingField === "email"
                  ? handleUpdateEmail
                  : editingField === "phone"
                  ? handleUpdatePhone
                  : editingField === "password"
                  ? handleUpdatePassword
                  : () => {}
              }
              disabled={isUpdating}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phone Verification Dialog - Enhanced */}
      <Dialog open={showPhoneVerification} onOpenChange={handlePhoneVerificationClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="w-5 h-5 text-orange-600" />
              Verify Phone Number
            </DialogTitle>
            <DialogDescription>
              We've sent a 6-digit verification code to
              <span className="block font-medium text-gray-900 dark:text-gray-100 mt-1">
                {formData.phone}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-sm font-medium">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 text-center">
                {verificationCode.length}/6 digits
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleVerifyPhoneCode}
                disabled={isVerifyingCode || verificationCode.length !== 6}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isVerifyingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={isSendingCode || resendCountdown > 0}
                className="min-w-[100px]"
              >
                {isSendingCode ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : resendCountdown > 0 ? (
                  `Resend (${resendCountdown}s)`
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>

            {resendCountdown > 0 && (
              <p className="text-xs text-center text-gray-500">
                Didn't receive the code? You can resend in {resendCountdown} seconds
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Verification Dialog */}
      <Dialog open={showEmailVerification} onOpenChange={handleEmailVerificationClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-orange-600" />
              Verify Email Address
            </DialogTitle>
            <DialogDescription>
              We've sent a verification link to
              <span className="block font-medium text-gray-900 dark:text-gray-100 mt-1">
                {formData.email}
              </span>
              <span className="text-xs text-gray-500 block mt-2">
                Check your inbox (and spam folder) for an email from us. Click the link in the email to verify your new address. The link is valid for 7 days.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button
              onClick={handleResendEmailLink}
              disabled={isSendingCode || emailResendCountdown > 0}
              variant="outline"
            >
              {isSendingCode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : emailResendCountdown > 0 ? (
                `Resend in ${emailResendCountdown}s`
              ) : (
                "Resend Verification Link"
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEmailVerification(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileDropdown;