import { usePayment } from "@/context/paymentContext";
import { IBookedOrderFetched } from "../../../types/types";
import React, { useState } from "react";
import { AppDispatch } from "@/state/store";
import { useDispatch } from "react-redux";
import { useAuth } from "@/context/authContext";
import {
  cancelBookedOrder,
  updateBookedOrderAsync,
} from "@/state/bookedOrdersSlice";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  CreditCardIcon,
  Loader2,
  MapPin,
  Package,
  XCircle,
} from "lucide-react";
import { branches } from "../../../data/branches";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CreditCard } from "node-appwrite";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"; // Assuming shadcn/ui tooltip; adjust path if needed
import { useRouter } from "next/navigation";
import OrderFeedbackModal from "@/app/myorders/[orderId]/OrderFeedbackModal";

interface OrdersListProps {
  orders: IBookedOrderFetched[];
  onCancel: (orderId: string) => void;
  onReorder: (order: IBookedOrderFetched) => void;
  paymentMethods: {
    value: string;
    label: string;
  }[];
}

const OrdersList = ({
  orders,
  onCancel,
  onReorder,
  paymentMethods,
}: OrdersListProps) => {
  const { payWithPaystack, paying, paymentError } = usePayment();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] =
    useState<IBookedOrderFetched | null>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [orderToPay, setOrderToPay] = useState<IBookedOrderFetched | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [orderToFeedback, setOrderToFeedback] =
    useState<IBookedOrderFetched | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const router = useRouter();

  const handleCancelClick = (order: IBookedOrderFetched) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const handlePayClick = (order: IBookedOrderFetched) => {
    setOrderToPay(order);
    setSelectedPaymentMethod(order.paymentMethod);
    setPayDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (orderToCancel) {
      setCancelling(true);
      try {
        await onCancel(orderToCancel.$id);
        setCancelDialogOpen(false);
        setOrderToCancel(null);
      } finally {
        setCancelling(false);
      }
    }
  };

  const handlePaymentMethodChange = async (newMethod: string) => {
    if (!orderToPay || orderToPay.paymentMethod === newMethod) return;
    setUpdatingPayment(true);
    try {
      await dispatch(
        updateBookedOrderAsync({
          orderId: orderToPay.$id,
          orderData: { paymentMethod: newMethod },
        })
      ).unwrap();
      setSelectedPaymentMethod(newMethod);
      toast.success("Payment method updated!");
    } catch (err) {
      toast.error("Failed to update payment method");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setCancelDialogOpen(open);
    if (!open) setOrderToCancel(null);
  };

  const handlePayDialogChange = (open: boolean) => {
    setPayDialogOpen(open);
    if (!open) setOrderToPay(null);
  };

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No orders in this category
        </p>
      </motion.div>
    );
  }

  const handlePayNow = async () => {
    if (!orderToPay) return;
    payWithPaystack({
      email: user?.email || "user@example.com",
      amount: orderToPay.total,
      reference: orderToPay.orderId || orderToPay.$id,
      orderId: orderToPay.$id,
      onSuccess: () => {
        setPayDialogOpen(false);
        setOrderToPay(null);
      },
      onClose: () => {},
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
      confirmed:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900",
      preparing:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900",
      out_for_delivery:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900",
      delivered:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900",
      cancelled:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900",
      failed:
        "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400"
    );
  };

  const handleLeaveFeedback = (order: IBookedOrderFetched) => {
    setOrderToFeedback(order);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!orderToFeedback) return;
    await dispatch(
      updateBookedOrderAsync({
        orderId: orderToFeedback.$id,
        orderData: {
          feedbackRating: rating,
          feedbackComment: comment,
        },
      })
    );
    setShowFeedbackModal(false);
    setOrderToFeedback(null);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    const deliveredOrderIds = orders
      .filter((order) => order.status === "delivered")
      .map((order) => order.$id);

    if (selectedOrders.length === deliveredOrderIds.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(deliveredOrderIds);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      for (const orderId of selectedOrders) {
        await dispatch(cancelBookedOrder(orderId)).unwrap();
      }
      setSelectedOrders([]);
      setDeleteDialogOpen(false);
      toast.success("Selected orders deleted successfully");
    } catch (error) {
      toast.error("Failed to delete selected orders");
    } finally {
      setDeleting(false);
    }
  };

  const deliveredOrdersCount = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  return (
    <TooltipProvider>
      <>
        {deliveredOrdersCount > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedOrders.length > 0 &&
                  selectedOrders.length === deliveredOrdersCount
                }
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Select All Delivered Orders
              </label>
            </div>
            {selectedOrders.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleOpenDeleteDialog}
                className="font-semibold"
              >
                Delete Selected ({selectedOrders.length})
              </Button>
            )}
          </div>
        )}
        <div className="grid gap-6">
          <AnimatePresence>
            {orders.map((order, idx) => {
              const branch = branches.find(
                (b) => b.id === order.selectedBranchId
              );
              const canCancel = ["pending", "confirmed"].includes(order.status);
              const canPay =
                !order.paid &&
                order.paymentMethod !== "cash" &&
                !["delivered", "completed"].includes(order.status);
              const canReorder = ["completed", "cancelled", "failed"].includes(
                order.status
              );
              const isDelivered = order.status === "delivered";

              return (
                <motion.div
                  key={order.$id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-1">
                            Order: {order.riderCode?.toUpperCase()}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${getStatusColor(
                              order.status
                            )} border font-semibold px-3 py-1 whitespace-nowrap`}
                          >
                            {order.status.replace(/_/g, " ").toUpperCase()}
                          </Badge>
                          {isDelivered && (
                            <Checkbox
                              checked={selectedOrders.includes(order.$id)}
                              onCheckedChange={() =>
                                handleSelectOrder(order.$id)
                              }
                            />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                      <div className="grid gap-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                              {branch ? branch.name : "-"}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {branch ? branch.address : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Total Amount
                          </span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ₦{order.total?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <CreditCardIcon className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                              {order.paymentMethod.replace(/_/g, " ")}
                            </span>
                          </div>
                          <Badge
                            className={
                              order.paid
                                ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                            }
                          >
                            {order.paid ? "Paid" : "Unpaid"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {order.status !== "delivered" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px] rounded-xl border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
                          >
                            <Link
                              href={`/myorders/${order.orderId}`}
                              className="w-full h-full flex items-center justify-center"
                            >
                              Track Order
                            </Link>
                          </Button>
                        )}
                        {order.status === "delivered" && (
                          <Button
                            onClick={() => handleLeaveFeedback(order)}
                            variant="outline"
                            size="sm"
                            className="flex-1 min-w-[120px] rounded-xl border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold"
                          >
                            Leave Feedback
                          </Button>
                        )}
                        {canPay && order.status !== "cancelled" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handlePayClick(order)}
                            className="flex-1 min-w-[120px] rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-semibold"
                          >
                            <CreditCardIcon className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        )}
                        {canCancel && !order.paid && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelClick(order)}
                                className="flex-1 min-w-[120px] rounded-xl bg-red-500 hover:bg-red-600 font-semibold"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancel this order</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {canCancel && order.paid && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              >
                                Cannot Cancel (Paid)
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Paid orders cannot be cancelled</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {canReorder && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onReorder(order)}
                            className="flex-1 min-w-[120px] rounded-xl font-semibold"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Feedback Modal - Moved outside the loop */}
        <OrderFeedbackModal
          customerPhone={orderToFeedback?.phone || ""}
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setOrderToFeedback(null);
          }}
          onSubmit={handleFeedbackSubmit}
          riderCode={orderToFeedback?.riderCode}
        />

        {/* Payment dialog */}
        <Dialog open={payDialogOpen} onOpenChange={handlePayDialogChange}>
          <DialogContent className="dark:bg-gray-800 rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="dark:text-white text-xl font-bold">
                Pay for Order
              </DialogTitle>
            </DialogHeader>
            {orderToPay && (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₦{orderToPay.total?.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    value={selectedPaymentMethod || orderToPay.paymentMethod}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    disabled={updatingPayment}
                  >
                    {paymentMethods
                      .filter((m) => m.value !== "cash")
                      .map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                  </select>
                </div>

                <Button
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-bold"
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
                      <CreditCardIcon className="w-5 h-5 mr-2" />
                      Pay ₦{orderToPay.total?.toLocaleString()}
                    </>
                  )}
                </Button>

                {paymentError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {paymentError}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-11 rounded-xl"
                >
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Order Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent className="dark:bg-gray-800 rounded-2xl max-w-md">
            <DialogHeader className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <DialogTitle className="dark:text-white text-xl font-bold text-center">
                Cancel Order?
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-center space-y-3">
              {orderToCancel?.status === "preparing" && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-900/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-300 text-left">
                      The restaurant may have already started preparing your
                      food. Cancelling now may not always be possible or may
                      incur a fee.
                    </p>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to cancel order{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  #{orderToCancel?.orderId}
                </span>
                ? This action cannot be undone.
              </p>
            </DialogDescription>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-11 rounded-xl font-medium"
                >
                  Keep Order
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="w-full sm:w-auto h-11 rounded-xl font-medium bg-red-500 hover:bg-red-600"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Confirm Cancel"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Selected Orders Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="dark:bg-gray-800 rounded-2xl max-w-md">
            <DialogHeader className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <DialogTitle className="dark:text-white text-xl font-bold text-center">
                Delete Selected Orders?
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-center space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete {selectedOrders.length} selected
                orders? This action cannot be undone.
              </p>
            </DialogDescription>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-11 rounded-xl font-medium"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="w-full sm:w-auto h-11 rounded-xl font-medium bg-red-500 hover:bg-red-600"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  );
};

export default OrdersList;
