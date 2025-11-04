import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import React from "react";

interface SignupFormProps {
  signupForm: any;
  handleSignupSubmit: (data: any) => void;
  phoneNumber: string;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  loading: string;
  isSigningUp: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({
  signupForm,
  handleSignupSubmit,
  phoneNumber,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  error,
  loading,
  isSigningUp,
}) => (
  <form
    onSubmit={signupForm.handleSubmit(handleSignupSubmit)}
    className="space-y-4"
  >
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label
          htmlFor="firstName"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          First Name
        </Label>
        <Input
          id="firstName"
          type="text"
          placeholder="Enter first name"
          {...signupForm.register("firstName")}
          className="h-12 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
        />
        {signupForm.formState.errors.firstName && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {signupForm.formState.errors.firstName.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="lastName"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Last Name
        </Label>
        <Input
          id="lastName"
          type="text"
          placeholder="Enter last name"
          {...signupForm.register("lastName")}
          className="h-12 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
        />
        {signupForm.formState.errors.lastName && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {signupForm.formState.errors.lastName.message}
          </p>
        )}
      </div>
    </div>
    <div className="space-y-2">
      <Label
        htmlFor="phoneNumber"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Phone Number
      </Label>
      <Input
        id="phoneNumber"
        type="tel"
        value={phoneNumber}
        disabled
        className="h-12 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
      />
    </div>
    <div className="space-y-2">
      <Label
        htmlFor="email"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Email Address
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="Enter your email"
        {...signupForm.register("email")}
        className="h-12 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
      />
      {signupForm.formState.errors.email && (
        <p className="text-sm text-red-500 dark:text-red-400">
          {signupForm.formState.errors.email.message}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label
        htmlFor="password"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Password
      </Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a password"
          {...signupForm.register("password")}
          className="h-12 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 pr-12"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {signupForm.formState.errors.password && (
        <p className="text-sm text-red-500 dark:text-red-400">
          {signupForm.formState.errors.password.message}
        </p>
      )}
    </div>
    <div className="space-y-2">
      <Label
        htmlFor="confirmPassword"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Confirm Password
      </Label>
      <div className="relative">
        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm your password"
          {...signupForm.register("confirmPassword")}
          className="h-12 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 pr-12"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowConfirmPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 focus:outline-none"
          aria-label={
            showConfirmPassword ? "Hide password" : "Show password"
          }
        >
          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {signupForm.formState.errors.confirmPassword && (
        <p className="text-sm text-red-500 dark:text-red-400">
          {signupForm.formState.errors.confirmPassword.message}
        </p>
      )}
    </div>
    {error && (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400 rounded-md p-3">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )}
    <Button
      type="submit"
      disabled={loading === "pending" || isSigningUp}
      className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-all duration-200"
    >
      {loading === "pending" || isSigningUp ? (
        <>
          {loading === "pending" ? (
            "Creating Account..."
          ) : (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          )}
        </>
      ) : (
        "Create Account"
      )}
    </Button>
    <div className="mt-6 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  </form>
);

export default SignupForm; 