import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TimeSlot {
  id: string;
  label: string;
  start: Date;
  end: Date | null;
}

interface DeliveryOptionsProps {
  deliveryDay: "today" | "tomorrow";
  setDeliveryDay: (day: "today" | "tomorrow") => void;
  timeSlots: TimeSlot[];
  selectedTimeSlot: string;
  setSelectedTimeSlot: (slot: string) => void;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({
  deliveryDay,
  setDeliveryDay,
  timeSlots,
  selectedTimeSlot,
  setSelectedTimeSlot,
}) => (
  <div className="pb-2">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Delivery Options</h2>
    <div className="space-y-6 mt-2">
      <div>
        <label className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 block">
          Delivery Day
        </label>
        <RadioGroup
          value={deliveryDay}
          onValueChange={setDeliveryDay}
          className="flex gap-6"
        >
          <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
            <RadioGroupItem value="today" />
            <span>Today</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
            <RadioGroupItem value="tomorrow" />
            <span>Tomorrow</span>
          </label>
        </RadioGroup>
      </div>
      {timeSlots.length > 0 && (
        <div>
          <label className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 block">
            Delivery Time
          </label>
          <RadioGroup
            value={selectedTimeSlot}
            onValueChange={setSelectedTimeSlot}
            className="grid grid-cols-2 gap-3"
          >
            {timeSlots.map((slot) => (
              <label
                key={slot.id}
                className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150"
              >
                <RadioGroupItem value={slot.id} />
                <span>{slot.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  </div>
);

export default DeliveryOptions; 