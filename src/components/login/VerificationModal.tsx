// components/VerificationModal.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User, Loader2, AlertCircle } from "lucide-react";

interface VerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificationCode: string;
  setVerificationCode: (value: string) => void;
  onCodeVerification: () => void;
  onResendCode: () => void;
  isVerifyingCode: boolean;
  isResendingCode: boolean;
  verificationError: string | null;
  adminEmail: string;
}

const VerificationModal = ({
  open,
  onOpenChange,
  verificationCode,
  setVerificationCode,
  onCodeVerification,
  onResendCode,
  isVerifyingCode,
  isResendingCode,
  verificationError,
  adminEmail,
}: VerificationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Admin Verification
          </DialogTitle>
          <DialogDescription>
            A verification code has been sent to {adminEmail}. Please enter it below to complete your login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">
              Verification Code
            </Label>
            <Input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="h-12"
              maxLength={6}
            />
            {verificationError && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {verificationError}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onCodeVerification}
              disabled={isVerifyingCode || verificationCode.length !== 6 || isResendingCode}
              className="flex-1"
            >
              {isVerifyingCode ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onResendCode}
              disabled={isResendingCode || isVerifyingCode}
            >
              {isResendingCode ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Resending...
                </>
              ) : (
                "Resend Code"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationModal;