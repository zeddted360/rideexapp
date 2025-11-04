import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">404 - Page Not Found</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-200">Sorry, the page you are looking for does not exist.</p>
        <Link href="/" className="inline-block mt-4 px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition">Back to Home</Link>
      </div>
    </div>
  );
} 