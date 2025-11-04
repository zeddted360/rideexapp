import { Loader2, LogOut, X } from 'lucide-react';
import React from 'react'

interface WarningModalProps {
  showWarningModal: boolean;
  setShowWarningModal: (value: boolean) => void;
  handleLogout: () => void;
  isLoggingOut: boolean;
}

const WarningModal:React.FC<WarningModalProps> = ({
    showWarningModal, 
    setShowWarningModal, 
    handleLogout, 
    isLoggingOut
}) => {
  return (
    <>
    {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Already Logged In
                </h3>
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  You cannot register as a vendor while already logged in. Please log out first. If you're new to the application, you can then proceed with registration.
                </p>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowWarningModal(false)}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default WarningModal