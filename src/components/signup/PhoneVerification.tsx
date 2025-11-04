import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React, { useRef } from "react";

type PhoneVerificationProps = {
  code: string | null;
  setCode: (v: string) => void;
  codeError: string;
  setCodeError: (v: string) => void;
  isVerifyingCode: boolean;
  handleCodeSubmit: (e: React.FormEvent) => void;
  handleResendCode: () => void;
  isSendingCode: boolean;
  resendCountdown: number;
};

const CODE_LENGTH = 6;

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  code,
  setCode,
  codeError,
  setCodeError,
  isVerifyingCode,
  handleCodeSubmit,
  handleResendCode,
  isSendingCode,
  resendCountdown,
}) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const codeArr = (code + "".repeat(CODE_LENGTH)).slice(0, CODE_LENGTH).split("");

  const handleInputChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCodeArr = codeArr.slice();
    newCodeArr[idx] = value;
    const newCode = newCodeArr.join("").replace(/\s/g, "");
    setCode(newCode);
    setCodeError("");
    if (value && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (codeArr[idx]) {
        // Clear current
        handleInputChange(idx, "");
      } else if (idx > 0) {
        // Move to previous
        inputsRef.current[idx - 1]?.focus();
        handleInputChange(idx - 1, "");
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  return (
    <form onSubmit={handleCodeSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="code"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Enter the 6-digit code sent to your phone
        </Label>
        <div className="flex gap-2 justify-center">
          {Array.from({ length: CODE_LENGTH }).map((_, idx) => (
            <Input
              key={idx}
              ref={el => { inputsRef.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={codeArr[idx] || ""}
              onChange={e => handleInputChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className="w-12 h-12 text-center text-xl font-mono bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 transition-all"
              autoFocus={idx === 0}
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>
        {codeError && (
          <p className="text-sm text-red-500 dark:text-red-400">{codeError}</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Button
          type="submit"
          disabled={isVerifyingCode}
          className="h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-all duration-200"
        >
          {isVerifyingCode ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSendingCode || resendCountdown > 0}
          onClick={handleResendCode}
          className="h-12 px-4 text-orange-600 border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 font-semibold rounded-lg transition-all"
        >
          {resendCountdown > 0
            ? `Resend in ${resendCountdown}s`
            : "Resend Code"}
        </Button>
      </div>
    </form>
  );
};

export default PhoneVerification; 