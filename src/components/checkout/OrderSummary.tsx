import React from "react";
import { PaymentMethod } from "./PaymentMethodSelector";
import { ICartItemFetched } from "../../../types/types";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface OrderSummaryProps {
  orders: ICartItemFetched[];
  subtotal: number;
  deliveryFee: number;
  isCalculatingFee: boolean;
  deliveryDistance: string;
  deliveryDuration: string;
  paymentMethod:PaymentMethod;
  originalDeliveryFee:number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orders,
  subtotal,
  deliveryFee,
  isCalculatingFee,
  deliveryDistance,
  deliveryDuration,
  paymentMethod,
  originalDeliveryFee
}) =>{ 
  
  return(
  <div>
    <div className="pb-2">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Order Summary</h2>
    </div>
    <div className="space-y-5">
      {orders.map((item, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-orange-50 dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-300 font-bold text-lg">
              {item.quantity}x
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {item.name}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  ₦{item.price}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  each
                </span>
                {Array.isArray(item.selectedExtras) && item.selectedExtras?.length > 0 && (
                  <span className="px-2 py-1 bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-medium rounded-full">
                    + Extras
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
            ₦{item.totalPrice}
          </span>
        </div>
      ))}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-base font-medium">
          <span>Subtotal</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-base font-medium">
          <span>Delivery Fee</span>
          <span className="flex items-center gap-2">
            {isCalculatingFee && (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            )}
            ₦{deliveryFee.toLocaleString()}
          </span>
        </div>
        {deliveryDistance && deliveryDuration && (
          <div className="text-xs text-gray-500 bg-orange-50 dark:bg-gray-800 p-2 rounded-lg mt-2">
            <div className="flex justify-between">
              <span>Distance:</span>
              <span>{deliveryDistance}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated time:</span>
              <span>{deliveryDuration}</span>
            </div>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between font-bold text-xl">
          <span>Total</span>
          <span>₦{(subtotal + deliveryFee).toLocaleString()}</span>
        </div>
      </div>
    </div>
  </div>
)};

export default OrderSummary;