// components/ErrorDisplay.tsx
import { WifiOff, AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  networkError: boolean;
  error: string | null;
  retryCount: number;
  onRetry: () => void;
  loading: string | null;
  getFriendlyErrorMessage: (error: string) => string;
}

const ErrorDisplay = ({
  networkError,
  error,
  retryCount,
  onRetry,
  loading,
  getFriendlyErrorMessage,
}: ErrorDisplayProps) => {
  if (!networkError && !error) return null;
  return (
    <>
      {networkError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Connection Problem
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Unable to connect to our servers. Please check your internet connection.
              </p>
              <button
                type="button"
                onClick={onRetry}
                disabled={loading === "pending"}
                className="mt-2 text-sm text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-medium underline disabled:opacity-50"
              >
                {loading === "pending" ? "Retrying..." : `Try Again ${retryCount > 0 ? `(${retryCount})` : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && !networkError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Login Failed
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {getFriendlyErrorMessage(error)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorDisplay;