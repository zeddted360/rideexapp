// @/components/checkout/OutOfReachModal.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface OutOfReachModalProps {
  setOutOfReach: (open: boolean) => void;
}

const OutOfReachModal: React.FC<OutOfReachModalProps> = ({ setOutOfReach }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Delivery Out of Reach
        </h3>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Sorry, delivery is not available for addresses beyond 30km from our
          branches. Please select a closer location to proceed with your order.
        </p>
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => setOutOfReach(false)}
            className="rounded-lg"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutOfReachModal;
