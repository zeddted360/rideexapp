import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";

type PhoneCollectionProps = {
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  phoneError: string;
  setPhoneError: (v: string) => void;
  isSendingCode: boolean;
  handlePhoneSubmit: (e: React.FormEvent) => void;
};

const PhoneCollection: React.FC<PhoneCollectionProps> = ({
  phoneNumber,
  setPhoneNumber,
  phoneError,
  setPhoneError,
  isSendingCode,
  handlePhoneSubmit,
}) => (
  <form onSubmit={handlePhoneSubmit} className="space-y-6">
    <div className="space-y-2">
      <Label
        htmlFor="phone"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Phone Number
      </Label>
      <Input
        id="phone"
        type="tel"
        value={phoneNumber}
        onChange={(e) => {
          setPhoneNumber(e.target.value);
          setPhoneError("");
        }}
        placeholder="+234 XXX XXX XXXX"
        className="h-12 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
        required
      />
      {phoneError && (
        <p className="text-sm text-red-500 dark:text-red-400">{phoneError}</p>
      )}
    </div>
    <Button
      type="submit"
      disabled={isSendingCode}
      className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-all duration-200"
    >
      {isSendingCode ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Code...
        </>
      ) : (
        "Send Verification Code"
      )}
    </Button>
  </form>
);

export default PhoneCollection; 