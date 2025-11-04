"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

const FAQPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/10 via-red-300/10 to-pink-300/10 dark:from-orange-500/15 dark:via-red-500/15 dark:to-pink-500/15"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[length:25px_25px]"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-gray-200/10 dark:border-white/10 relative z-10">
        <button
          className="group p-2 rounded-full bg-gray-900/10 dark:bg-white/10 hover:bg-orange-400/20 dark:hover:bg-orange-500/20 transition-all duration-300 flex items-center justify-center"
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
          FAQ
        </h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Introduction */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-7">
              Find answers to common questions about RideEx, your on-demand food delivery platform. If you need further assistance, contact us at{' '}
              <a href="mailto:rideexapp@gmail.com" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
                rideexapp@gmail.com
              </a>{' '}
              or{' '}
              <a href="tel:+2347072087857" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">
                +234 707 208 7857
              </a>
              .
            </p>
          </div>

          {/* FAQ Sections */}
          {[
            {
              question: 'What is RideEx food delivery?',
              answer: 'RideEx is an on-demand food delivery platform that connects customers with a wide range of restaurants and vendors, ensuring quick, reliable, and convenient delivery of meals and essentials.',
            },
            {
              question: 'Where is your office located?',
              answer: 'Our head office is located in Owerri, Nigeria. For specific directions or visits, kindly check our contact section.',
            },
            {
              question: 'What are your working hours?',
              answer: 'We operate daily from 8:00am to 8:00pm, including weekends and public holidays, to serve our customers efficiently.',
            },
            {
              question: 'What services does RideEx offer?',
              answer: 'RideEx provides food delivery, grocery delivery, and vendor support services designed to make ordering and delivery fast, secure, and reliable.',
            },
            {
              question: 'Where do you cover?',
              answer: 'Our delivery services currently cover Owerri, New Owerri and Obinze. We are continuously expanding our service areas to reach more customers.',
            },
            {
              question: 'How can I place an order?',
              answer: 'Orders can be placed directly through the RideEx mobile application, website, or WhatsApp chatbot. Simply browse available restaurants or vendors, select your items, and proceed to checkout.',
            },
            {
              question: 'What payment methods are accepted?',
              answer: 'We accept secure payment options which include Bank transfer, and cash on delivery.',
            },
            {
              question: 'How is the delivery fee calculated?',
              answer: 'Delivery fees are determined by distance, order size, and location. The applicable fee will be displayed before you confirm your order.',
            },
            {
              question: 'There are missing or incomplete products in my order. What should I do?',
              answer: 'In such cases, please contact our customer support immediately through our <a href="https://wa.me/2347072087857" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">WhatsApp line</a>. We will promptly investigate and resolve the issue.',
            },
            {
              question: 'Can I cancel my order?',
              answer: 'Yes. Orders may be canceled within a limited time frame after placement. Cancellation policies may vary depending on the restaurant/vendor, and applicable charges may apply.',
            },
            {
              question: 'Should I tip my couriers?',
              answer: 'Tipping is optional but greatly appreciated. It serves as recognition for the effort and service of our delivery partners.',
            },
            {
              question: 'Is my personal information secure?',
              answer: 'Yes. We prioritize data privacy and employ advanced security measures to ensure that your personal information remains safe and confidential.',
            },
            {
              question: 'How can I contact customer support?',
              answer: 'You can reach our customer support team through <a href="tel:+2347072087857" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">+234 707 208 7857</a> or via email at <a href="mailto:rideexapp@gmail.com" className="text-orange-600 dark:text-orange-400 underline hover:text-red-600 dark:hover:text-red-400 transition-colors">rideexapp@gmail.com</a>. We are available to assist you during working hours.',
            },
          ].map((faq, index) => (
            <div key={index} className="my-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-orange-600 dark:border-orange-400 pl-4 transform hover:scale-105 transition-transform duration-300">
                {faq.question}
              </h2>
              <div
                className="text-sm text-gray-700 dark:text-gray-300 leading-7 bg-gray-100/10 dark:bg-white/10 p-5 rounded-xl shadow-md hover:bg-gray-100/15 dark:hover:bg-white/15 transition-all duration-300"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FAQPage;