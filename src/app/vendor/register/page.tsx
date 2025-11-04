// app/page.tsx
import VendorRegistrationForm from '@/components/vendor/VendorRegistrationForm';
import React from 'react';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header - Server Rendered */}
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-yellow-200 via-orange-300 to-red-300 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 bg-clip-text text-transparent mb-4 animate-pulse">
            Build your business online with
          </h1>
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-6 drop-shadow-lg">
            Rideex
          </h2>
          <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed max-w-xl mx-auto bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-inner">
            Join the growing number of users leveraging Rideex to empower their businesses. Manage your deliveries, 
            update your vendor page, and boost your brand awareness to reach more customers.
          </p>
        </div>

        {/* Client Component for the Form */}
        <VendorRegistrationForm />
      </div>
    </div>
  );
}