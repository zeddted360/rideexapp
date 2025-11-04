import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Truck } from "lucide-react";

interface PaymentMethodProps {
  paymentMethod: "card" | "cash";
  setPaymentMethod: (method: "card" | "cash") => void;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/80 rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value: "card" | "cash") => setPaymentMethod(value)}
          className="space-y-4"
          aria-label="Payment method selection"
        >
          <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
            <RadioGroupItem value="card" id="card" />
            <CreditCard className="w-6 h-6 text-orange-500" />
            <span>Credit/Debit Card</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
            <RadioGroupItem value="cash" id="cash" />
            <Truck className="w-6 h-6 text-orange-500" />
            <span>Cash on Delivery</span>
          </label>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
