"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CookiesPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/10 via-red-300/10 to-pink-300/10 dark:from-orange-500/15 dark:via-red-500/15 dark:to-pink-500/15"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[length:25px_25px]"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-gray-200/10 dark:border-white/10 relative z-10">
        <button
          className="p-2 rounded-full bg-gray-900/10 dark:bg-white/10 hover:bg-orange-400/20 dark:hover:bg-orange-500/20 transition-all duration-300 flex items-center justify-center"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-orange-600 dark:text-orange-400 group-hover:text-red-600 dark:group-hover:text-red-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 dark:from-orange-400 to-red-600 dark:to-red-500 bg-clip-text text-transparent animate-pulse-slow">
          Cookies Policy
        </h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Introduction */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              RideEx Cookies Policy
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-7">
              This page explains what cookies are, how RideEx uses them, and how you can manage your preferences. Cookies help us improve your experience on our website and app. For more details, feel free to contact us at{' '}
              <Link href="mailto:support@rideex.com" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
                support@rideex.com
              </Link>
            </p>
          </div>

          {/* What Are Cookies? */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              What Are Cookies?
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              Cookies are small text files stored on your device (like your phone or computer) when you visit our website or use our app. They help us remember your preferences, make the site work better, and provide a smoother experience. For example, they might keep you logged in or track how you use our services.
            </div>
          </div>

          {/* How We Use Cookies */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              How We Use Cookies
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              We use cookies for:
              <ul className="list-disc list-inside mt-2">
                <li><strong>Essential Cookies:</strong> To run our website and app, like keeping you signed in.</li>
                <li><strong>Performance Cookies:</strong> To understand how you use our services and improve them.</li>
                <li><strong>Functional Cookies:</strong> To remember your settings or preferences.</li>
              </ul>
              We may also work with third parties (like analytics or delivery partners) who set their own cookies, but we only allow this with your consent where required by law.
            </div>
          </div>

          {/* Managing Your Cookies */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              Managing Your Cookies
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              You can control cookies through your browser settings. Here’s how:
              <ul className="list-disc list-inside mt-2">
                <li>Check your browser’s “Settings” or “Privacy” menu (e.g., Chrome, Safari).</li>
                <li>Look for an option to manage cookies or clear browsing data.</li>
                <li>Choose to accept, block, or delete cookies as you prefer.</li>
              </ul>
              Note that blocking all cookies might affect how our website or app works. We’re working on adding a tool to let you manage cookies directly on our site stay tuned!
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200/10 dark:border-white/10 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-2">
              Last updated: September 2025
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              © 2025 RideEx. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CookiesPage;