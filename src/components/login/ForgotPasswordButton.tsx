// components/login/ForgotPasswordButton.tsx (update to show loading)
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface ForgotPasswordButtonProps {
  onClick: () => void;
  isResetting?: boolean; // Add prop
}

const ForgotPasswordButton = ({
  onClick,
  isResetting,
}: ForgotPasswordButtonProps) => {
  return (
    <Button
      variant="link"
      onClick={onClick}
      disabled={isResetting}
      className="text-orange-600 p-0 h-auto"
    >
      {isResetting ? (
        <>
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        "Forgot Password?"
      )}
    </Button>
  );
};

export default ForgotPasswordButton;
