// components/vendor/SuccessModal.tsx
import { CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessModalProps {
  showSuccesModal: boolean;
  setShowSuccesModal: (value: boolean) => void;
}

const SuccessModal = ({ showSuccesModal, setShowSuccesModal }: SuccessModalProps) => {
  const router = useRouter();

  if (!showSuccesModal) return null;

  const handleContinue = () => {
    setShowSuccesModal(false);
         router.push("/");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Registration Successful
            </h3>
            <button
              onClick={() => setShowSuccesModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4 mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              Your account is pending admin approval. Check your email for a welcome message.
            </p>
          </div>
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleContinue}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Continue
            </button>
            <button
              onClick={() => setShowSuccesModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;