import React from 'react'
import { motion } from "framer-motion";

const LoadingClient = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4 text-center"
      >
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 dark:border-gray-700"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent animate-spin"></div>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Setting up your checkout
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Loading maps and options...
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoadingClient