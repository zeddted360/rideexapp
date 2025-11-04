// components/ForgotPasswordButton.tsx
interface ForgotPasswordButtonProps {
  onClick: () => void;
}

const ForgotPasswordButton = ({ onClick }: ForgotPasswordButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
    >
      Forgot Password?
    </button>
  );
};

export default ForgotPasswordButton;