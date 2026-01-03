// components/login/LoginForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/utils/authSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  loading: string | null;
  errors: { [key: string]: string | undefined };
  fieldErrors: { [key: string]: string };
  emailRef?: React.RefObject<HTMLInputElement | null>; // allow nullable ref
}

const LoginForm = ({
  onSubmit,
  loading,
  errors,
  fieldErrors,
  emailRef,
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailEl = form.elements.namedItem("email") as HTMLInputElement | null;
    const passwordEl = form.elements.namedItem(
      "password"
    ) as HTMLInputElement | null;
    const rememberEl = form.elements.namedItem(
      "rememberMe"
    ) as HTMLInputElement | null;

    const data: LoginFormData = {
      email: emailEl?.value ?? "",
      password: passwordEl?.value ?? "",
      rememberMe: rememberEl?.checked ?? false,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            ref={emailRef} // Attach ref here (chains with register if using in parent, but since no register, direct ref)
            className={`h-12 pr-10 ${
              fieldErrors.email
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
            placeholder="Enter your email"
          />
          {fieldErrors.email && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>
        {fieldErrors.email && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            className={`h-12 pr-20 ${
              fieldErrors.password
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }`}
            placeholder="Enter your password"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {fieldErrors.password && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-gray-400 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 focus:outline-none transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        {fieldErrors.password && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            // Note: Without register, handle manually if needed
          />
          <Label
            htmlFor="rememberMe"
            className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            Remember me
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading === "pending"}
        className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
      >
        {loading === "pending" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
