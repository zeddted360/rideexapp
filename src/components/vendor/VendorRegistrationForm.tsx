"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Tag,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
} from "lucide-react";
import {
  VendorRegistrationFormData,
  vendorRegistrationSchema,
} from "@/utils/schema";
import { account, databases, validateEnv } from "@/utils/appwrite";
import { ID } from "appwrite";
import { IVendor } from "../../../types/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUserAsync, loginAsync } from "@/state/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { useAuth } from "@/context/authContext";
import { catchmentAreas } from "../../../data/catchmentArea";
import WarningModal from "./WarningModal";
import SuccessModal from "./SuccessModal";

const VendorRegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [whatsappUpdates, setWhatsappUpdates] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSuccesModal, setShowSuccesModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  const isAuthenticated = !!user?.userId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VendorRegistrationFormData>({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      agreeTerms: false,
    },
    mode: "onChange",
  });

  const categories = [
    "Restaurant & Food",
    "Grocery & Supermarket",
    "Pharmacy & Health",
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await account.deleteSession("current");
      dispatch(getCurrentUserAsync());
      setShowWarningModal(false);
      // Optionally redirect to home or stay on page
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setSubmitError("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const onSubmit = async (data: VendorRegistrationFormData) => {
    if (isAuthenticated) {
      setShowWarningModal(true);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data for Appwrite
      const vendorData: IVendor = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        catchmentArea: data.catchmentArea,
        location: data.location,
        businessName: data.businessName,
        category: data.category,
        password: data.password,
        agreeTerms: data.agreeTerms,
        whatsappUpdates,
        status: "pending",
      };

      // Save to Appwrite database
      const vendorId = ID.unique();
      const { databaseId, vendorsCollectionId, userCollectionId } =
        validateEnv();
      await databases.createDocument(
        databaseId,
        vendorsCollectionId,
        vendorId,
        vendorData
      );
      // 1. Create the user account
      const user = await account.create(
        vendorId,
        data.email,
        data.password,
        `${data.fullName}`
      );
      // 2. Create user profile in users collection
      await databases.createDocument(databaseId, userCollectionId, user.$id, {
        userId: user.$id,
        fullName: `${data.fullName}`,
        phone: data.phoneNumber,
        isVendor: true,
      });

      // 3. Login the user to get the session
      const loginResult = await dispatch(
        loginAsync({
          email: data.email,
          password: data.password,
          rememberMe: true,
        })
      );
      //trying to update vendor
      dispatch(getCurrentUserAsync());

      // Call API route to send email notifications
      const notificationResponse = await fetch(
        "/api/vendor/send-notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendorEmail: data.email,
            vendorName: data.fullName,
            businessName: data.businessName,
            whatsappUpdates: whatsappUpdates,
            phoneNumber: data.phoneNumber,
            catchmentArea: data.catchmentArea,
            location: data.location,
            category: data.category,
          }),
        }
      );

      if (!notificationResponse.ok) {
        console.error(
          "Failed to send notifications:",
          await notificationResponse.text()
        );
        // Continue with success message even if notifications fail
      }

      setShowSuccesModal(true);
    } catch (error: any) {
      console.error("Registration failed:", error);
      if (error.code === 409) {
        setSubmitError(
          "A user with the same id, email, or phone already exists"
        );
      } else {
        setSubmitError(
          error.message || "Registration failed. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-0 p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Fill out the fields to set up your vendor account
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Create your business profile and start connecting with customers
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("fullName")}
                type="text"
                className={`w-full h-12 pl-10 pr-10 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                  errors.fullName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.fullName && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter Your Business Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("phoneNumber")}
                type="tel"
                className={`w-full h-12 pl-10 pr-10 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                  errors.phoneNumber
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                }`}
                placeholder="+234 XXX XXX XXXX"
              />
              {errors.phoneNumber && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter Your Business Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("email")}
                type="email"
                className={`w-full h-12 pl-10 pr-10 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                  errors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                }`}
                placeholder="Enter your business email"
              />
              {errors.email && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Catchment Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Catchment area
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                {...register("catchmentArea")}
                className={`w-full h-12 pl-10 pr-10 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors appearance-none ${
                  errors.catchmentArea
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                }`}
              >
                <option value="">Select your catchment area</option>
                {catchmentAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              {errors.catchmentArea && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.catchmentArea && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.catchmentArea.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("location")}
                type="text"
                className={`w-full h-12 pl-10 pr-10 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                  errors.location
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                }`}
                placeholder="Enter your specific location"
              />
              {errors.location && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.location && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Business name
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("businessName")}
                type="text"
                className={`w-full h-12 pl-10 pr-10 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                  errors.businessName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                }`}
                placeholder="Enter your business name"
              />
              {errors.businessName && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.businessName && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.businessName.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                {...register("category")}
                className={`w-full h-12 pl-10 pr-10 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors appearance-none ${
                  errors.category
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                }`}
              >
                <option value="">Select business category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.category && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full h-12 pl-10 pr-20 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                  errors.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                }`}
                placeholder="Create a secure password"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {errors.password && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-orange-500 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full h-12 pl-10 pr-20 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                  errors.confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                }`}
                placeholder="Confirm your password"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {errors.confirmPassword && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-orange-500 focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* WhatsApp Updates Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              I accept to receive updates via
            </h4>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setWhatsappUpdates(!whatsappUpdates)}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  whatsappUpdates
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-green-400"
                }`}
              >
                <div className="relative">
                  <MessageCircle
                    className={`w-6 h-6 transition-colors ${
                      whatsappUpdates ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  {/* WhatsApp-style icon overlay */}
                  <div
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full transition-colors ${
                      whatsappUpdates ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </div>
                <div className="text-left">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      whatsappUpdates
                        ? "text-green-700 dark:text-green-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    WhatsApp
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get instant updates on your phone
                  </p>
                </div>
                <div
                  className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    whatsappUpdates
                      ? "border-green-500 bg-green-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {whatsappUpdates && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>
            </div>

            {whatsappUpdates && (
              <div className="ml-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ You'll receive order updates, delivery notifications, and
                  business insights via WhatsApp on{" "}
                  {watch("phoneNumber") || "your registered phone number"}.
                </p>
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                {...register("agreeTerms")}
                type="checkbox"
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
              />
              <div className="text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  By checking this box, you agree to our{" "}
                  <a
                    href="/terms"
                    className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium underline"
                  >
                    terms and conditions
                  </a>
                </p>
              </div>
            </label>
            {errors.agreeTerms && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 ml-7">
                <AlertCircle className="w-3 h-3" />
                {errors.agreeTerms.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Create account
              </>
            )}
          </button>
          {/* submit error */}

          {submitError && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{submitError}</p>
            </div>
          )}
        </form>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              href="/vendor/login"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
            >
              Login as a vendor
            </Link>
          </p>
        </div>
      </div>
      {/* success modal */}
      <SuccessModal
        showSuccesModal={showSuccesModal}
        setShowSuccesModal={setShowSuccesModal}
      />
      {/* Warning Modal */}
      <WarningModal
        handleLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        showWarningModal={showWarningModal}
        setShowWarningModal={setShowWarningModal}
      />
    </>
  );
};
export default VendorRegistrationForm;
