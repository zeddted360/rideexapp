"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

const PrivacyPolicyPage = () => {
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
          Privacy Policy
        </h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Introduction */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              RideEx Privacy Policy
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-7">
              This Privacy Policy explains how RideEx, a Moto freight and logistics company, collects, uses, and protects your personal information when you use our services, website, or mobile app. For questions, contact us at{' '}
              <a href="mailto:privacy@rideex.com" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
                privacy@rideex.com
              </a>{' '}
              or{' '}
              <a href="tel:+2348012345678" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
                +234 801 234 5678
              </a>
              .
            </p>
          </div>

          {/* 1. Information We Collect */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              1. Information We Collect
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes your name, email address, phone number, delivery address, and payment information. We also collect data automatically, like your device information and location, to enhance our services.
            </div>
          </div>

          {/* 2. How We Use Your Information */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              2. How We Use Your Information
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              We use the information we collect to provide, maintain, and improve our Moto freight and logistics services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers related to restaurants, grocery, pharmacy, and health services.
            </div>
          </div>

          {/* 3. Information Sharing */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              3. Information Sharing
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              We may share your information with restaurants, delivery partners, and service providers (e.g., payment processors) to fulfill your orders, with third-party logistics partners for efficient delivery, and as required by law or to protect our rights and safety.
            </div>
          </div>

          {/* 4. Location Information */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              4. Location Information
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              We collect location information to provide delivery services, show nearby service providers (e.g., restaurants, pharmacies), and optimize our platform. You can control location sharing through your device or browser settings.
            </div>
          </div>

          {/* 5. Data Security */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              5. Data Security
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or mobile network is 100% secure.
            </div>
          </div>

          {/* 6. Cookies and Tracking */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              6. Cookies and Tracking
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              We use cookies and similar tracking technologies to collect and use personal information about you, such as your browsing behavior and preferences. You can manage cookies through your browser or device settings. See our{' '}
              <a href="/cookies" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
                Cookies Policy
              </a>{' '}
              for more details.
            </div>
          </div>

          {/* 7. Data Retention */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              7. Data Retention
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements with you and our partners.
            </div>
          </div>

          {/* 8. Your Rights */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              8. Your Rights
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@rideex.com" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
                privacy@rideex.com
              </a>
              .
            </div>
          </div>

          {/* 9. Children's Privacy */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              9. Children's Privacy
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn of such data, we will delete it promptly.
            </div>
          </div>

          {/* 10. Changes to Privacy Policy */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              10. Changes to Privacy Policy
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </div>
          </div>

          {/* 11. Contact Us */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              11. Contact Us
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@rideex.com" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
                privacy@rideex.com
              </a>{' '}
              or through our app's support feature.
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

export default PrivacyPolicyPage;