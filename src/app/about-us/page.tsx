"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AboutPage = () => {
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
          About Us
        </h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <Image
              src="/images/rideex_food_delivery_logo.jpg" 
              alt="RideEx Logo"
              width={150}
              height={150}
              className="mx-auto mb-4 rounded-full border-4 border-orange-600 dark:border-orange-400"
            />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to RideEx
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-7">
              At Rideex Logistics and Freight company Limited, we are revolutionizing the way people access essential services across Nigeria and beyond. Established with a vision to deliver efficiency and convenience, we combine cutting-edge technology with a robust motorcycle-based logistics network.
            </p>
          </div>

          {/* Our Mission */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              Our Mission
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              Our mission is to connect communities with a wide range of services—restaurants, fruit, grocery and supermarket, pharmacy, and health—through fast, reliable, and affordable delivery. We strive to empower local businesses and enhance customer satisfaction with every ride.
            </div>
          </div>

          {/* Our Services */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              Our Services
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              As a Moto freight and logistics company, RideEx facilitates the ordering, delivery, and logistics of goods and services. Our efficient motorcycle network ensures quick deliveries from:
              <ul className="list-disc list-inside mt-2">
                <li>Restaurants</li>
                <li>Fruit and grocery/supermarket stores</li>
                <li>Pharmacy and health services</li>
              </ul>
              We leverage our mobile application to provide a seamless experience for both users and service providers.
            </div>
          </div>

          {/* Our Vision */}
          <div className="my-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
              Our Vision
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300">
              We aim to be the leading Moto logistics provider in Africa, expanding our reach to deliver innovative solutions that bridge the gap between consumers and essential services, all while promoting sustainability through eco-friendly transport.
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200/10 dark:border-white/10 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-2">
              Established: 2024 | Last updated: September 2025
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

export default AboutPage;