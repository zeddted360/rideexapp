// components/OutOfStockModal.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface OutOfStockModalProps {
  itemName: string;
  onClose: () => void;
}

export const OutOfStockModal: React.FC<OutOfStockModalProps> = ({
  itemName,
  onClose,
}) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    onClick={onClose}
  >
    <div
      className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
        <AlertCircle className="w-11 h-11 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Oops!
      </h2>
      <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {itemName}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
        This deal is currently unavailable. Please check back later or explore
        other offers!
      </p>
      <Button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
      >
        Got it, thanks!
      </Button>
    </div>
  </div>
);
