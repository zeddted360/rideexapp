// components/GuestLoginButton.tsx
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

interface GuestLoginButtonProps {
  onClick: () => void;
  loading: string | null;
}

const GuestLoginButton = ({ onClick, loading }: GuestLoginButtonProps) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading === "pending"}
      variant="outline"
      className="w-full h-12 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all duration-200 rounded-xl flex items-center justify-center gap-3 bg-white dark:bg-gray-800"
    >
      <UserCircle className="w-4 h-4 mr-2" />
      Continue as Guest
    </Button>
  );
};

export default GuestLoginButton;