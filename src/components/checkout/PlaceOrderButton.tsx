import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ICartItem } from "../../../types/types";

interface PlaceOrderButtonProps {
  subtotal: number;
  deliveryFee: number;
  address: string;
  phoneNumber: string;
  orders: ICartItem[];
  isOrderLoading: boolean;
  handlePlaceOrder: () => void;
  showConfirmation: boolean;
  setShowConfirmation: (open: boolean) => void;
  handleConfirmOrder: () => void;
  error: string | null;
  totalAmount: number;
}

const PlaceOrderButton: React.FC<PlaceOrderButtonProps> = ({
  subtotal,
  deliveryFee,
  address,
  phoneNumber,
  orders,
  isOrderLoading,
  handlePlaceOrder,
  showConfirmation,
  setShowConfirmation,
  handleConfirmOrder,
  error,
  totalAmount,
}) => {
  const [confirmTotal, setConfirmTotal] = useState(0);

  useEffect(() => {
    if (showConfirmation) {
      setConfirmTotal(subtotal + deliveryFee);
    }
  }, [showConfirmation]);

  return (
    <>
      <Button
        onClick={handlePlaceOrder}
        disabled={
          !address || !phoneNumber || orders.length === 0 || isOrderLoading
        }
        className="w-full py-5 text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg transition-all duration-200"
      >
        Place Order - ₦{(subtotal + deliveryFee).toLocaleString()}
      </Button>
      {error && (
        <p className="text-red-600 text-base text-center font-semibold mt-2">
          {error}
        </p>
      )}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-0"
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Confirm Order
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                Are you sure you want to place this order for {" "}
                <b>₦{confirmTotal.toLocaleString()}</b>?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmOrder}
                  disabled={isOrderLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-xl py-3"
                >
                  {isOrderLoading ? "Processing..." : "Confirm Order"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isOrderLoading}
                  className="flex-1 rounded-xl font-semibold text-lg py-3"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlaceOrderButton;
