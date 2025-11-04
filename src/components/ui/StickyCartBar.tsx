import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { Button } from "./button";
import { useRouter } from "next/navigation";

const StickyCartBar: React.FC = () => {
  const cart = useSelector((state: RootState) => state.orders.orders);
  const router = useRouter();
  const itemCount = cart ? cart.length : 0;
  if (itemCount === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg p-4 flex justify-between items-center z-50 md:hidden">
      <span className="font-semibold text-gray-900 dark:text-gray-100">{itemCount} item{itemCount > 1 ? "s" : ""} in cart</span>
      <Button
        className="bg-orange-500 text-white rounded-full px-6 py-2"
        onClick={() => router.push("/checkout")}
      >
        Checkout
      </Button>
    </div>
  );
};

export default StickyCartBar; 