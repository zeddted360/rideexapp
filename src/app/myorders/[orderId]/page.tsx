"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import {
  fetchBookedOrderById,
  cancelBookedOrder,
  updateBookedOrderAsync,
} from "@/state/bookedOrdersSlice";
import { branches } from "../../../../data/branches";
import {
  CheckCircle,
  MapPin,
  CreditCard,
  Landmark,
  Truck,
  XCircle,
  Loader2,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  AlertCircle,
  Phone,
  Copy,
  Check,
  Star,
} from "lucide-react";
import Image from "next/image";
import { client, validateEnv, fileUrl } from "@/utils/appwrite";
import { usePayment } from "@/context/paymentContext";
import { Button } from "@/components/ui/button";
import { listAsyncFeaturedItems } from "@/state/featuredSlice";
import { listAsyncMenusItem } from "@/state/menuSlice";
import { listAsyncPopularItems } from "@/state/popularSlice";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/context/authContext";
import SupportModal from "./SupportModal";
import CancelDialog from "./CancelDialog";
import OrderFeedbackModal from "./OrderFeedbackModal";
import LodingState from "./LodingState";
import ErrorState from "./ErrorState";
import NoBranchOrder from "./NoBranchOrder";
import CanceledStatus from "./CanceledStatus";
import { listAsyncPromoOfferItems } from "@/state/offerSlice";

const statusSteps = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

function getStatusIndex(status: string) {
  return statusSteps.findIndex((s) => s.key === status) !== -1
    ? statusSteps.findIndex((s) => s.key === status)
    : 0;
}

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentOrder, loading, error } = useSelector(
    (state: RootState) => state.bookedOrders
  );

  const menuItems = useSelector((state: RootState) => state.menuItem.menuItems);
  const featuredItems = useSelector(
    (state: RootState) => state.featuredItem.featuredItems
  );
  const popularItems = useSelector(
    (state: RootState) => state.popularItem.popularItems
  );
  const promoOffers = useSelector(
    (state: RootState) => state.promoOffer.offersItem
  );

  const { payWithPaystack, paying, paymentError } = usePayment();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [showItems, setShowItems] = React.useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [cancelling, setCancelling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { user } = useAuth();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string>("");

  const findItemById = (id: string) => {
    return (
      menuItems.find((item) => item.$id === id) ||
      featuredItems.find((item) => item.$id === id) ||
      popularItems.find((item) => item.$id === id) ||
      promoOffers.find((item) => item.$id === id)
    );
  };

  const getStatusMessage = (
    status: string,
    deliveryDuration: string | undefined
  ) => {
    switch (status) {
      case "pending":
        return "Your order is currently pending";
      case "confirmed":
        return "Your order has been confirmed by the admin";
      case "preparing":
        return "Your order is being prepared";
      case "out_for_delivery":
        if (!remainingTime && deliveryDuration) {
          return `Estimated arrival: ${deliveryDuration}`;
        }
        if (remainingTime === "arriving now") {
          return "Your order is arriving now!";
        }
        return `Estimated arrival in ${remainingTime}`;
      case "delivered":
        return "Your order has been delivered!";
      default:
        return "Your order is being processed";
    }
  };

  useEffect(() => {
    if (orderId) {
      dispatch(fetchBookedOrderById(orderId));
      dispatch(listAsyncFeaturedItems());
      dispatch(listAsyncMenusItem());
      dispatch(listAsyncPopularItems());
      dispatch(listAsyncPromoOfferItems());
    }
  }, [orderId, dispatch]);

  useEffect(() => {
    if (!orderId) return;
    const { bookedOrdersCollectionId, databaseId } = validateEnv();
    const channel = `databases.${databaseId}.collections.${bookedOrdersCollectionId}.documents.${orderId}`;
    const unsubscribe = client.subscribe(channel, (response: any) => {
      if (
        response.events.includes("databases.*.collections.*.documents.*.update")
      ) {
        dispatch(fetchBookedOrderById(orderId));
      }
    });
    return () => {
      unsubscribe();
    };
  }, [orderId, dispatch]);

  // Detect status change to delivered for feedback
  useEffect(() => {
    if (
      currentOrder?.status === "delivered" &&
      !currentOrder.feedbackRating &&
      prevStatus !== "delivered"
    ) {
      setShowFeedbackModal(true);
    }
    if (currentOrder?.status) {
      setPrevStatus(currentOrder.status);
    }
  }, [currentOrder?.status, prevStatus, currentOrder?.feedbackRating]);

  // Save end time when status changes to out_for_delivery (while page is open)
  useEffect(() => {
    if (
      currentOrder?.status === "out_for_delivery" &&
      prevStatus &&
      prevStatus !== "out_for_delivery" &&
      currentOrder.deliveryDuration
    ) {
      const match = currentOrder.deliveryDuration.match(/(\d+)/);
      const minutes = match ? parseInt(match[1], 10) : 30;
      if (minutes > 0) {
        const endTime = new Date(Date.now() + minutes * 60000);
        localStorage.setItem(
          `deliveryEndTime_${orderId}`,
          endTime.getTime().toString()
        );
      }
    }
  }, [
    currentOrder?.status,
    prevStatus,
    currentOrder?.deliveryDuration,
    orderId,
  ]);

  // Countdown timer logic with localStorage persistence
  useEffect(() => {
    if (
      currentOrder?.status !== "out_for_delivery" ||
      !currentOrder.deliveryDuration
    ) {
      setRemainingTime("");
      return;
    }

    const storageKey = `deliveryEndTime_${orderId}`;
    let savedEndTimeStr = localStorage.getItem(storageKey);
    let endTime: Date;

    if (savedEndTimeStr) {
      endTime = new Date(parseInt(savedEndTimeStr, 10));
    } else {
      const match = currentOrder.deliveryDuration.match(/(\d+)/);
      const minutes = match ? parseInt(match[1], 10) : 30;
      endTime = new Date(Date.now() + minutes * 60000);
      localStorage.setItem(storageKey, endTime.getTime().toString());
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setRemainingTime("arriving now");
        localStorage.removeItem(storageKey);
        clearInterval(interval);
        return;
      }

      const min = Math.floor(diff / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setRemainingTime(`${min}:${sec.toString().padStart(2, "0")}`);
    }, 1000);

    // Initial calculation
    const initialDiff = endTime.getTime() - Date.now();
    if (initialDiff <= 0) {
      setRemainingTime("arriving now");
      localStorage.removeItem(storageKey);
    } else {
      const min = Math.floor(initialDiff / 60000);
      const sec = Math.floor((initialDiff % 60000) / 1000);
      setRemainingTime(`${min}:${sec.toString().padStart(2, "0")}`);
    }

    return () => clearInterval(interval);
  }, [currentOrder?.status, currentOrder?.deliveryDuration, orderId]);

  // Clean up localStorage when order is delivered or cancelled
  useEffect(() => {
    if (
      currentOrder &&
      (currentOrder.status === "delivered" ||
        currentOrder.status === "cancelled")
    ) {
      localStorage.removeItem(`deliveryEndTime_${orderId}`);
      setRemainingTime("");
    }
  }, [currentOrder?.status, orderId]);

  const branch = currentOrder
    ? branches.find((b) => b.id === currentOrder.selectedBranchId)
    : null;
  const statusIdx = currentOrder ? getStatusIndex(currentOrder.status) : 0;

  const riderCode =
    currentOrder?.riderCode ||
    currentOrder?.orderId?.slice(-4).toUpperCase() ||
    "";

  const canCancel = currentOrder?.status === "pending";

  const supportPhone = branch
    ? branch.phone || "+234 800 000 0000"
    : "+234 800 000 0000";

  const handleCopyCode = async () => {
    if (riderCode) {
      try {
        await navigator.clipboard.writeText(riderCode);
        setIsCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy code");
      }
    }
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;

    if (currentOrder.status !== "pending") {
      toast.error("Only pending orders can be cancelled");
      setCancelDialogOpen(false);
      return;
    }

    setCancelling(true);
    try {
      await dispatch(cancelBookedOrder(currentOrder.$id));
      toast.success("Order cancelled successfully!");
      router.push("/myorders");
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Error cancelling order:", error);
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
    }
  };

  const isCash = currentOrder?.paymentMethod === "cash";
  const fullTotal = currentOrder?.total ?? 0;
  const deliveryFeeStored = currentOrder?.deliveryFee ?? 0;
  const amountToPayOnline = isCash ? fullTotal - deliveryFeeStored : fullTotal;

  const amountDueOnDelivery = isCash ? deliveryFeeStored : 0;

  const handlePayNow = () => {
    if (!currentOrder) return;

    payWithPaystack({
      email: user?.email || "user@example.com",
      amount: amountToPayOnline,
      reference: currentOrder.orderId || currentOrder.$id,
      orderId: currentOrder.$id,
      onSuccess: () => {
        dispatch(fetchBookedOrderById(currentOrder.$id));
      },
      onClose: () => {},
    });
  };

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!currentOrder) return;
    await dispatch(
      updateBookedOrderAsync({
        orderId: currentOrder.$id,
        orderData: {
          feedbackRating: rating,
          feedbackComment: comment,
        },
      })
    );
  };

  if (loading) return <LodingState />;

  if (error) return <ErrorState error={error} />;

  if (!currentOrder || !branch) return <NoBranchOrder />;

  if (currentOrder.status === "cancelled") return <CanceledStatus />;

  const itemIds: string[] = (currentOrder as any).itemIds || [];

  const statusMessage = getStatusMessage(
    currentOrder.status,
    currentOrder.deliveryDuration
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/myorders")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Button>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          {/* Order Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg opacity-90 mb-1 font-bold">
                  Hi {user?.username}👋
                </h3>
                <p className="text-xl">{statusMessage}.</p>
              </div>
              <motion.div
                className="relative flex items-center justify-center w-16 h-16 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors"
                onClick={() => setShowSupportModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/40"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/30"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                <motion.div
                  animate={{
                    opacity: [1, 0.3, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Phone className="w-8 h-8 text-white relative z-10" />
                </motion.div>
              </motion.div>
            </div>
            <div className="flex items-center justify-between gap-2 gap-x-4 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-md border border-white/30">
              <div className="">
                <p className="text-white/80 font-medium text-xs tracking-wide">
                  Delivery confirmation code
                </p>
                <p className="text-white/80 text-sm font-bold mt-1 tracking-wide">
                  Show this code to your rider
                </p>
              </div>

              <div className="relative flex items-center gap-2">
                <div className="relative group">
                  <div className="flex gap-1">
                    {riderCode
                      .toUpperCase()
                      .split("")
                      .map((digit, index) => (
                        <div
                          key={index}
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
                    className="absolute -top-2 -right-2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 shadow-lg border border-white/50 dark:border-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
            </div>
          </div>

          {/* Status Progress */}
          <div className="px-6 py-8 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              {statusSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center flex-1">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 mb-2 ${
                          idx <= statusIdx
                            ? "bg-orange-500 border-orange-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/50"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {idx < statusIdx ? (
                          <CheckCircle
                            className="w-6 h-6 text-white"
                            strokeWidth={2.5}
                          />
                        ) : idx === statusIdx ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <StepIcon className="w-6 h-6 text-white" />
                          </motion.div>
                        ) : (
                          <StepIcon className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                        )}
                      </motion.div>
                      <p
                        className={`text-xs font-medium text-center leading-tight ${
                          idx <= statusIdx
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div className="flex-1 h-1 -mt-8 mx-2">
                        <div
                          className={`h-full rounded transition-all duration-500 ${
                            idx < statusIdx
                              ? "bg-orange-500"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="px-6 py-6 space-y-4">
            {/* Branch Info */}
            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
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
            </div>

            {/* Payment Method & Delivery Fee */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {currentOrder.paymentMethod === "card" ? (
                  <CreditCard className="w-5 h-5 text-orange-500" />
                ) : (
                  <Landmark className="w-5 h-5 text-orange-500" />
                )}
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Payment Method
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900 dark:text-white capitalize block">
                  {currentOrder.paymentMethod.replace(/_/g, " ")}
                </span>
                {isCash && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                    🛵 Pay Delivery Fee on Arrival Only
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Delivery Fee
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900 dark:text-white block">
                  ₦{currentOrder.deliveryFee?.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                  {isCash ? "Paid on delivery" : "Included in payment"}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 rounded-2xl border border-orange-200 dark:border-orange-900/30">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Total
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  ₦{currentOrder.total?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Required Alert */}
            <AnimatePresence>
              {!currentOrder.paid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                        Payment Required
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Please complete payment to process your order
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Items */}
          {itemIds.length > 0 && (
            <div className="px-6 py-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Order Items ({itemIds.length})
                </h3>
                {!showItems && (
                  <Button
                    onClick={() => setShowItems(true)}
                    variant="ghost"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    View Items
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {showItems && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {itemIds.slice(0, visibleCount).map((id) => {
                      const item = findItemById(id);
                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/40 transition-colors"
                        >
                          {item && item.image ? (
                            <Image
                              src={
                                fileUrl(
                                  validateEnv().featuredBucketId,
                                  item.image
                                ) ||
                                fileUrl(
                                  validateEnv().popularBucketId,
                                  item.image
                                ) ||
                                fileUrl(
                                  validateEnv().menuBucketId,
                                  item.image
                                ) ||
                                fileUrl(
                                  validateEnv().promoOfferBucketId,
                                  item.image
                                )
                              }
                              alt={item.name}
                              width={60}
                              height={60}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-15 h-15 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {item ? item.name : `Item ${id}`}
                            </h4>
                            {item && (
                              <>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                  {item.description ||
                                    "No description available"}
                                </p>
                                <div className="flex items-center gap-2">
                                  {item.category && (
                                    <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full">
                                      {item.category}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}

                    <div className="flex gap-3 pt-2">
                      {visibleCount < itemIds.length && (
                        <Button
                          onClick={() => setVisibleCount((c) => c + 4)}
                          variant="outline"
                          className="flex-1 h-10 text-sm"
                        >
                          Show More ({itemIds.length - visibleCount} remaining)
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setShowItems(false);
                          setVisibleCount(4);
                        }}
                        variant="outline"
                        className="flex-1 h-10 text-sm"
                      >
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Hide Items
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900/30 space-y-3">
            {!currentOrder.paid && (
              <Button
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-base shadow-lg hover:shadow-xl transition-all"
                onClick={handlePayNow}
                disabled={paying}
              >
                {paying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ₦{amountToPayOnline.toLocaleString()} Now
                  </>
                )}
              </Button>
            )}

            {isCash && amountDueOnDelivery > 0 && !currentOrder.paid && (
              <p className="text-sm text-center text-amber-700 dark:text-amber-300 mt-2">
                + ₦{amountDueOnDelivery.toLocaleString()} delivery fee to rider
                on arrival
              </p>
            )}

            {canCancel && !currentOrder.paid && (
              <Button
                onClick={() => setCancelDialogOpen(true)}
                variant="outline"
                className="w-full h-12 border-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold rounded-xl"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
            )}

            {canCancel && currentOrder.paid && (
              <div className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-300 text-gray-500 cursor-not-allowed"
                  disabled
                >
                  Cannot Cancel (Paid)
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Paid orders cannot be cancelled
                </p>
              </div>
            )}

            {paymentError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {paymentError}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
        >
          Thank you for choosing{" "}
          <span className="font-bold text-orange-600">RideEx</span>
        </motion.p>
      </div>

      <CancelDialog
        cancelDialogOpen={cancelDialogOpen}
        cancelling={cancelling}
        currentOrder={currentOrder}
        handleCancelOrder={handleCancelOrder}
        setCancelDialogOpen={setCancelDialogOpen}
      />

      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        branchName={branch.name}
        supportPhone={supportPhone}
        currentOrder={currentOrder}
        supportEmail="rideexlogistics@gmail.com"
        whatsappNumber="+2348161427755"
      />

      <OrderFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        customerPhone={currentOrder.phone}
      />
    </div>
  );
}
