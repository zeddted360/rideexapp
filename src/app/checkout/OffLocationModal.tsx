import React from "react";
import { motion } from "framer-motion";

interface IShowCashModalProps {
  setOffLocationModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const MapPinIcon = () => (
  <svg
    className="w-10 h-10 text-orange-500 dark:text-orange-400"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

const OffLocationModal: React.FC<IShowCashModalProps> = ({
  setOffLocationModal,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => setOffLocationModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 pt-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-orange-200 dark:ring-orange-800/50">
          <MapPinIcon />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">
          Please Confirm Your Location
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-center mb-4">
          Your device's location seems a bit off. To ensure accuracy, please add
          your spot manually.
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-8 space-y-2 px-4">
          <li>
            Use the <strong>'Add'</strong> button in the delivery{" "}
            <strong>address</strong> section.{" "}
          </li>
          <li>
            Or <strong>tap directly on the map</strong> to select the correct
            location.
          </li>
        </ul>
        <button
          onClick={() => setOffLocationModal(false)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 dark:focus-visible:ring-orange-600"
        >
          Got it, I'll select it manually
        </button>
      </motion.div>
    </motion.div>
  );
};

export default OffLocationModal;
