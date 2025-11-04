import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Info,
  Copy,
  Check,
} from "lucide-react";
import React, { useState } from "react";
import { IBookedOrderFetched } from "../../../../types/types";
import Link from "next/link";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
  supportPhone: string;
  currentOrder: IBookedOrderFetched;
  supportEmail?: string;
  whatsappNumber?: string;
  branchAddress?: string;
  operatingHours?: string;
}

const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  branchName,
  supportPhone,
  currentOrder,
  supportEmail,
  whatsappNumber,
  branchAddress,
  operatingHours,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const copyToClipboard = async (text: string, type: "phone" | "order") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "phone") {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      } else {
        setCopiedOrderId(true);
        setTimeout(() => setCopiedOrderId(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, "");
  };

  const whatsappMessage = `Hello! I need support with my order #${
    currentOrder.orderNumber || currentOrder._id
  } from ${branchName}.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto dark:bg-gray-800 rounded-2xl border-none shadow-2xl">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mx-auto shadow-lg">
            <Phone className="w-7 h-7 text-white" />
          </div>
          <DialogTitle className="dark:text-gray-100 text-2xl font-bold text-center">
            {branchName}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
            We're here to help with your order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Order Information */}
          <div className="bg-orange-50 dark:bg-gray-700/50 rounded-xl p-4 border border-orange-100 dark:border-gray-600">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Your Order ID
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {currentOrder.riderCode || currentOrder._id}
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        currentOrder.orderNumber || currentOrder._id,
                        "order"
                      )
                    }
                    className="flex-shrink-0 p-1 hover:bg-orange-100 dark:hover:bg-gray-600 rounded transition-colors"
                    aria-label="Copy order ID"
                  >
                    {copiedOrderId ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Reference this when contacting support
                </p>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Contact Methods
            </h3>

            {/* Phone Support */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {supportPhone}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(supportPhone, "phone")}
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  aria-label="Copy phone number"
                >
                  {copiedPhone ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                >
                  <a href={`tel:${supportPhone}`}>Call</a>
                </Button>
              </div>
            </div>

            {/* WhatsApp Support */}
            {(whatsappNumber || supportPhone) && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      WhatsApp
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Quick Response
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 flex-shrink-0"
                >
                  <Link
                    href={`https://wa.me/${formatPhoneForWhatsApp(
                      whatsappNumber || supportPhone
                    )}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat
                  </Link>
                </Button>
              </div>
            )}

            {/* Email Support */}
            {supportEmail && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 ">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate ">
                      {supportEmail}
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 flex-shrink-0"
                >
                  <Link
                    href={`mailto:${supportEmail}?subject=Support Request - Order ${
                      currentOrder.riderCode || currentOrder._id
                    }`}
                  >
                    Email
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Additional Information */}
          {(branchAddress || operatingHours) && (
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {branchAddress && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                    {branchAddress}
                  </p>
                </div>
              )}
              {operatingHours && (
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {operatingHours}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal;
