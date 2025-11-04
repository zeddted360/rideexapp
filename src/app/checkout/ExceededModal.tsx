import { Button } from "@/components/ui/button";
import React, { Dispatch, FC, SetStateAction } from "react";

interface ExceedModalProps {
  deliveryDistance: string;
  setShowDistanceExceededModal: Dispatch<SetStateAction<boolean>>;
}
const ExceededModal: FC<ExceedModalProps> = ({
  deliveryDistance,
  setShowDistanceExceededModal,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Delivery Unavailable
        </h3>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Sorry, the delivery distance exceeds 30km ({deliveryDistance}). We
          currently do not deliver to locations beyond 30km from the restaurant.
          Please select a closer delivery address.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => setShowDistanceExceededModal(false)}
            className="flex-1"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExceededModal;
