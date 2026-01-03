// app/reset-password/page.tsx
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
