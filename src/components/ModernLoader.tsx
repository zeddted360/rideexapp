import { Loader2 } from 'lucide-react';
import React from 'react'

const ModernLoader = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-600 dark:text-gray-300">Checking access...</p>
      </div>
    </div>
  );
};

export default ModernLoader