"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Truck,
  MapPin,
  CreditCard,
  X,
  Loader2,
  Clock,
  Package,
  ThumbsUp,
  Copy,
  Check,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import {
  fetchBookedOrdersByUserId,
  updateBookedOrderRiderCode,
  cancelBookedOrder,
  updateBookedOrderAsync,
} from "@/state/bookedOrdersSlice";
import { branches } from "../../../data/branches";
import { useRouter } from "next/navigation";
import { usePayment } from "@/context/paymentContext";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import OrderFeedbackModal from "../myorders/[orderId]/OrderFeedbackModal";
import NoLatestOrder from "./NoLatestOrder";
import ErrorState from "./ErrorState";
import Loading from "./Loading";
import CancelDialog from "./CancelDialog";

export default function OrderConfirmation() {
  const SERVICE_CHARGE = 200; // Must match CheckoutClient

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.auth);
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.bookedOrders
  );
  const { payWithPaystack, paying, paymentError } = usePayment();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Load user's orders
  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchBookedOrdersByUserId(user.userId));
    }
  }, [user?.userId, dispatch]);

  const latestOrder = orders && orders.length > 0 ? orders[0] : null;

  const branch = latestOrder
    ? branches.find((b) => b.id === latestOrder.selectedBranchId)
    : null;

  const riderCode = latestOrder?.orderId
    ? latestOrder.orderId.slice(-4).toUpperCase()
    : "";

  // Save riderCode if not already set
  useEffect(() => {
    if (latestOrder && !latestOrder.riderCode && riderCode) {
      dispatch(updateBookedOrderRiderCode({ id: latestOrder.$id, riderCode }));
    }
  }, [latestOrder, riderCode, dispatch]);

  const canCancel =
    latestOrder &&
    ["pending", "confirmed", "preparing"].includes(latestOrder.status);

  const isCash = latestOrder?.paymentMethod === "cash";


  const fullTotal = latestOrder?.total ?? 0; 
  const deliveryFeeStored = latestOrder?.deliveryFee ?? 0; 

  const amountToPayOnline =
    latestOrder?.amountPaidOnline ??
    (isCash
      ? fullTotal - deliveryFeeStored
      : fullTotal); 

  const amountDueOnDelivery =
    latestOrder?.amountDueOnDelivery ?? (isCash ? deliveryFeeStored : 0); 

  // Copy code
  const handleCopyCode = async () => {
    if (riderCode) {
      try {
        await navigator.clipboard.writeText(riderCode);
        setIsCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      } catch {
        toast.error("Failed to copy code");
      }
    }
  };

  // Pay now with correct amount
  const handlePayNow = () => {
    if (!latestOrder) return;

    payWithPaystack({
      email: user?.email || "user@example.com",
      amount: amountToPayOnline, 
      reference: latestOrder.orderId || latestOrder.$id,
      orderId: latestOrder.$id,
      onSuccess: () => router.push(`/myorders/${latestOrder.orderId}`),
      onClose: () => {},
    });
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!latestOrder) return;
    setCancelling(true);
    try {
      await dispatch(cancelBookedOrder(latestOrder.$id));
      toast.success("Order cancelled successfully!");
      router.push("/myorders");
    } catch (e) {
      toast.error("Failed to cancel order");
      console.error(e);
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
    }
  };

  // Track or Leave Feedback
  const handleTrackOrFeedback = () => {
    if (!latestOrder) return;

    if (latestOrder.status === "delivered") {
      setShowFeedbackModal(true);
    } else {
      router.push(`/myorders/${latestOrder.orderId}`);
    }
  };

  // Submit feedback to DB
  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!latestOrder) return;

    try {
      await dispatch(
        updateBookedOrderAsync({
          orderId: latestOrder.$id,
          orderData: {
            feedbackRating: rating,
            feedbackComment: comment,
          },
        })
      );
    } catch (err) {
      console.error("Failed to save feedback:", err);
      throw err;
    }
  };

  // Close modal
  const handleCloseFeedback = () => {
    setShowFeedbackModal(false);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  if (!latestOrder || !branch) return <NoLatestOrder />;

  /* --------------------------- Main UI --------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-8 sm:py-12">
      {/* Feedback Modal */}
      <OrderFeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleCloseFeedback}
        onSubmit={handleFeedbackSubmit}
        customerPhone={user?.phoneNumber ?? ""}
        riderCode={latestOrder.riderCode}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto w-full"
      >
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl text-gray-600 dark:text-gray-400 hover:text-orange-500 border border-gray-200 dark:border-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Success Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-8 sm:px-8 sm:py-10 text-center overflow-hidden">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
              className="relative mx-auto mb-4 w-20 h-20"
            >
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
              <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle
                  className="w-12 h-12 text-orange-500"
                  strokeWidth={2.5}
                />
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
            >
              Order Confirmed!
            </motion.h2>

            {/* Rider Code */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex flex-col items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-full border border-white/30"
            >
              <p className="text-white/80 font-medium text-sm tracking-wide uppercase">
                Delivery Confirmation Code
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/30 rounded-full px-3 py-2">
                  <ThumbsUp className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-sm tracking-wide">
                    Show to Rider
                  </span>
                </div>

                <div className="relative group">
                  <div className="flex gap-1">
                    {riderCode.split("").map((digit, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 bg-white/50 dark:bg-white/30 rounded-lg flex items-center justify-center text-xl font-extrabold text-gray-900 dark:text-white shadow-md"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyCode}
                    className="absolute -top-2 -right-2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 shadow-lg border border-white/50 dark:border-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Copy code"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Body */}
          <div className="px-6 py-8 sm:px-8 space-y-6">
            {/* Delivery Time */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/30"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Your order is currently{" "}
                  {latestOrder.status.replace(/_/g, " ").toLowerCase()}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {latestOrder.deliveryTime || "ASAP"}
                </p>
              </div>
            </motion.div>

            {/* Branch Info */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    {branch.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {branch.address}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-orange-600 border border-orange-200 dark:border-orange-900/40">
                    <Truck className="w-3.5 h-3.5" />
                    Delivery
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Payment Method
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                {latestOrder.paymentMethod.replace(/_/g, " ")}
              </span>
            </motion.div>

            {/* Cash Payment Breakdown (only shown for cash) */}
            {isCash && amountDueOnDelivery > 0 && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800"
              >
                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">
                  Payment Breakdown (Cash on Delivery)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Now (Items + Service Charge):</span>
                    <span className="font-bold">
                      ₦{amountToPayOnline.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>On Delivery (Delivery Fee):</span>
                    <span className="font-bold">
                      ₦{amountDueOnDelivery.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t border-amber-300 dark:border-amber-700 mt-2">
                    <span>Total Order Value:</span>
                    <span>₦{fullTotal.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3 pt-2"
            >
              {/* Pay Now Button - Only if not paid */}
              {!latestOrder.paid && (
                <Button
                  onClick={handlePayNow}
                  disabled={paying}
                  className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-base shadow-lg hover:shadow-xl"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay ₦{amountToPayOnline.toLocaleString()} Now
                    </>
                  )}
                </Button>
              )}

              {/* Additional info for cash */}
              {isCash && amountDueOnDelivery > 0 && !latestOrder.paid && (
                <p className="text-sm text-center text-amber-700 dark:text-amber-300">
                  + ₦{amountDueOnDelivery.toLocaleString()} delivery fee to
                  rider on arrival
                </p>
              )}

              {/* Track / Feedback + Cancel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleTrackOrFeedback}
                  className="h-12 flex items-center justify-center bg-white dark:bg-gray-900 border-2 border-orange-500 text-orange-600 dark:text-orange-400 font-semibold rounded-xl text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 shadow-md hover:shadow-lg"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  {latestOrder.status === "delivered"
                    ? "Leave Feedback"
                    : "Track Order"}
                </Button>

                {canCancel && (
                  <Button
                    onClick={() => setCancelDialogOpen(true)}
                    variant="outline"
                    className="h-12 border-2 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold rounded-xl text-sm shadow-md hover:shadow-lg"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Payment Error */}
            <AnimatePresence>
              {paymentError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                >
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {paymentError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
        >
          Need help? Contact support or view your order history
        </motion.p>
      </motion.div>

      {/* Cancel Dialog */}
      <CancelDialog
        cancelDialogOpen={cancelDialogOpen}
        cancelling={cancelling}
        handleCancelOrder={handleCancelOrder}
        latestOrder={latestOrder}
        riderCode={riderCode}
        setCancelDialogOpen={setCancelDialogOpen}
      />
    </div>
  );
}
