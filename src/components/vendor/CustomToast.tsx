import { toast } from "react-hot-toast";
import { AlertCircle, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CustomToastProps {
  message: string;
  actionText?: string;
  action?: () => void;
  t: any; // Toast object from react-hot-toast
}

const CustomToast = ({ message, actionText, action, t }: CustomToastProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl shadow-lg max-w-sm",
        "bg-gradient-to-r from-orange-500 to-pink-500 text-white",
        "border border-orange-300 dark:border-pink-700",
        "animate-in slide-in-from-right duration-300"
      )}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1 text-sm font-medium">{message}</div>
      {actionText && action && (
        <button
          onClick={() => {
            action();
            toast.dismiss(t.id); // Dismiss toast on action
          }}
          className="px-3 py-1 bg-white text-orange-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
        >
          {actionText}
        </button>
      )}
      <button
        onClick={() => toast.dismiss(t.id)}
        className="ml-2 text-white hover:text-gray-200"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Utility to show custom error toast
export const showErrorToast = (
  message: string,
  actionText?: string,
  action?: () => void
) => {
  toast.custom(
    (t) => (
      <CustomToast
        message={message}
        actionText={actionText}
        action={action}
        t={t}
      />
    ),
    {
      duration: 10000,
      position: "top-right",
    }
  );
};
