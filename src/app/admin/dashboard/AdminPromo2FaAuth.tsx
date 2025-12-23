import React, { Dispatch, FC } from "react";

interface AdminPromo2FaAuthProps {
  promotionState: {
    open: boolean;
    targetUserId: string;
    targetUserName: string;
    targetUserEmail: string;
    step: "send" | "verify";
    code: string;
    loading: boolean;
    error: string;
  };
  setPromotionState: Dispatch<
    React.SetStateAction<{
      open: boolean;
      targetUserId: string;
      targetUserName: string;
      targetUserEmail: string;
      step: "send" | "verify";
      code: string;
      loading: boolean;
      error: string;
    }>
  >;
  sendPromotionCode: () => Promise<string | undefined>;
  verifyAndPromote: () => Promise<void>;
}

const AdminPromo2FaAuth: FC<AdminPromo2FaAuthProps> = ({
  promotionState,
  sendPromotionCode,
  setPromotionState,
  verifyAndPromote,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-center mb-4">
          Promote to Admin
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {promotionState.targetUserName}
        </p>

        {promotionState.step === "send" ? (
          <>
            <p className="text-sm text-center mb-6">
              A 6-digit code will be sent to their email.
            </p>
            {promotionState.error && (
              <p className="text-red-600 text-center mb-4">
                {promotionState.error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setPromotionState((s) => ({ ...s, open: false }))
                }
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={sendPromotionCode}
                disabled={promotionState.loading}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl disabled:opacity-70"
              >
                {promotionState.loading ? "Sending..." : "Send Code"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-center mb-4">
              Enter the code sent to their email
            </p>
            <input
              type="text"
              maxLength={6}
              value={promotionState.code}
              onChange={(e) =>
                setPromotionState((s) => ({
                  ...s,
                  code: e.target.value.replace(/\D/g, ""),
                }))
              }
              placeholder="000000"
              className="w-full text-center text-4xl tracking-widest py-4 border rounded-xl mb-4"
            />
            {promotionState.error && (
              <p className="text-red-600 text-center mb-4">
                {promotionState.error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setPromotionState((s) => ({ ...s, open: false }))
                }
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={verifyAndPromote}
                disabled={
                  promotionState.loading || promotionState.code.length !== 6
                }
                className="flex-1 py-3 bg-green-600 text-white rounded-xl disabled:opacity-70"
              >
                {promotionState.loading ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPromo2FaAuth;
