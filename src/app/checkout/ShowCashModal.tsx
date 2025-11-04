import React from 'react'
import { motion } from "framer-motion";

interface IShowCashModalProps {
    setShowCashModal:React.Dispatch<React.SetStateAction<boolean>>;
}

const ShowCashModal:React.FC<IShowCashModalProps> = ({setShowCashModal}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowCashModal(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Cash on Delivery Details
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed">
          Only delivery fees are paid on delivery. Payment for the items must be
          made before preparation begins.
        </p>
        <button
          onClick={() => setShowCashModal(false)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200"
        >
          Got it, continue
        </button>
      </motion.div>
    </motion.div>
  );
}

export default ShowCashModal