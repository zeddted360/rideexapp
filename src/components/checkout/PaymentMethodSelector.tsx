import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Truck, Landmark, PhoneCall } from "lucide-react";

export type PaymentMethod = "card" | "cash" | "bank";

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;

}


const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  setPaymentMethod,

}) => { 


  
  
  return(
  <Card className="bg-transparent border-0 p-0">
    <CardHeader className="pb-2 bg-transparent border-0">
      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        Payment Method
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <RadioGroup
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        className="space-y-4"
      >
        <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
          <RadioGroupItem value="card" />
          <CreditCard className="w-6 h-6 text-orange-500" />
          <span>Credit/Debit Card</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
          <RadioGroupItem value="cash" />
          <Truck className="w-6 h-6 text-orange-500" />
          <span>Cash on Delivery - Items paid now, delivery fee on arrival</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
          <RadioGroupItem value="bank" />
          <Landmark className="w-6 h-6 text-orange-500" />
          <span>Bank Transfer</span>
        </label>
      </RadioGroup>
    </CardContent>
  </Card>
)};

export default PaymentMethodSelector; 