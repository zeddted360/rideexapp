'use client';
import React from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Something went wrong</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-200">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => reset()}
          className="inline-block mt-4 px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
        >
          Try Again
        </button>
        <Link href="/" className="block mt-4 text-orange-600 hover:underline">Back to Home</Link>
      </div>
    </div>
  );
} 