import { useRouter } from 'next/navigation'
import React from 'react'

const AccessRestriction = () => {
    const router = useRouter()
  return (
    <>
    <div className="min-h-screen flex items-center justify-center p-4  animate-gradient-xy">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20 dark:border-gray-700/50 transition-all duration-300 hover:scale-[1.01]">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-200 dark:ring-red-800/50">
          <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6.75-4h13.5C17.03 13 18 11.97 18 10.75V8.25C18 7.03 17.03 6 15.75 6H8.25C7.03 6 6 7.03 6 8.25v2.5C6 11.97 6.97 13 8.25 13z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4.5C9 3.12 10.12 2 11.5 2h1C13.88 2 15 3.12 15 4.5V6" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
          Access Denied
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-8">
          Sorry, this area is restricted. Access is limited to <strong>approved vendors and administrators</strong>.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => router.back()} 
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
    </>
  )
}

export default AccessRestriction