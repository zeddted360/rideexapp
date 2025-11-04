// components/PhoneModal.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Phone, Loader2 } from "lucide-react";

interface PhoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onPhoneSubmit: () => void;
  isCheckingPhone: boolean;
}

const PhoneModal = ({
  open,
  onOpenChange,
  phoneNumber,
  setPhoneNumber,
  onPhoneSubmit,
  isCheckingPhone,
}: PhoneModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Quick Guest Access
          </DialogTitle>
          <DialogDescription>
            Enter your phone number to continue as a guest. We'll remember you for future visits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+2348012345678"
              className="h-12"
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll check if you have an existing account
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onPhoneSubmit}
              disabled={isCheckingPhone || !phoneNumber.trim()}
              className="flex-1"
            >
              {isCheckingPhone ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                "Continue as Guest"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCheckingPhone}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneModal;