"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  XCircle,
  Clock,
  Truck,
  CheckCircle,
  Filter,
} from "lucide-react";
import { AppDispatch, RootState } from "@/state/store";
import {
  fetchBookedOrdersByUserId,
  cancelBookedOrder,
} from "@/state/bookedOrdersSlice";
import { branches } from "../../../data/branches";
import { IBookedOrderFetched, OrderStatus } from "../../../types/types";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/authContext";
import { client, validateEnv } from "@/utils/appwrite";
import { motion} from "framer-motion";
import OrdersList from "./OrdersList";

const ORDER_STATUS_TABS: {
  key: OrderStatus | "completed" | "all";
  label: string;
  icon: any;
}[] = [
  { key: "all", label: "All", icon: Package },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
  { key: "cancelled", label: "Cancelled", icon: XCircle },
  { key: "completed", label: "Completed", icon: CheckCircle },
];

const MyOrders = () => {
  const { userId, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.bookedOrders
  );
  const [activeTab, setActiveTab] = useState<OrderStatus | "completed" | "all">(
    "all"
  );

  const paymentMethods = [
    { value: "card", label: "Card" },
    { value: "transfer", label: "Bank Transfer" },
    { value: "wallet", label: "Wallet" },
    { value: "cash", label: "Cash on Delivery" },
  ];

  useEffect(() => {
    if (isAuthenticated && userId) {
      dispatch(fetchBookedOrdersByUserId(userId));
      const { bookedOrdersCollectionId, databaseId } = validateEnv();
      const channel = `databases.${databaseId}.collections.${bookedOrdersCollectionId}.documents`;
      const unsubscribe = client.subscribe(channel, (response: any) => {
        if (
          response.payload?.customerId === userId &&
          (response.events.some((e: string) => e.endsWith(".create")) ||
            response.events.some((e: string) => e.endsWith(".update")) ||
            response.events.some((e: string) => e.endsWith(".delete")))
        ) {
          dispatch(fetchBookedOrdersByUserId(userId));
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [dispatch, isAuthenticated, userId]);

  const getFilteredOrders = (status: OrderStatus | "completed" | "all") => {
    if (status === "all") {
      return orders;
    }
    if (status === "completed") {
      return orders.filter(
        (order) => order.status === "delivered" && order.paid
      );
    }
    return orders.filter((order) => order.status === status);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const order = orders.find((o) => o.$id === orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }

      await dispatch(cancelBookedOrder(orderId)).unwrap();

      toast.success("Order cancelled successfully!");
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Error cancelling order:", error);
    }
  };

  const handleReorder = (order: IBookedOrderFetched) => {
    toast.success("Reorder functionality coming soon!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="rounded-2xl shadow-xl border-0 bg-white dark:bg-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                Please log in to view your orders
              </p>
              <Button
                asChild
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold"
              >
                <Link href="/login">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative w-20 h-20 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-orange-200 dark:border-orange-800 border-t-orange-500"
            />
          </div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Loading your orders...
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="rounded-2xl shadow-xl border-0 bg-white dark:bg-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Error Loading Orders
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                {error}
              </p>
              <Button
                onClick={() => dispatch(fetchBookedOrdersByUserId(userId!))}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const allOrders = orders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your food delivery orders
          </p>
        </motion.div>

        {allOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-2xl shadow-xl border-0 bg-white dark:bg-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6"
                >
                  <Package className="w-12 h-12 text-orange-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Orders Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
                  You haven't placed any orders yet. Start exploring our
                  delicious menu!
                </p>
                <Button
                  asChild
                  className="h-12 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold shadow-lg"
                >
                  <Link href="/menu">Browse Menu</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Filter by status
                </span>
              </div>
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 -mx-4 px-4 sm:mx-0 sm:px-0">
                {ORDER_STATUS_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const count =
                    tab.key === "all"
                      ? orders.length
                      : tab.key === "completed"
                      ? getFilteredOrders("completed").length
                      : getFilteredOrders(tab.key as OrderStatus).length;

                  return (
                    <motion.button
                      key={tab.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        activeTab === tab.key
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/50"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          activeTab === tab.key
                            ? "bg-white/20"
                            : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <OrdersList
              orders={getFilteredOrders(activeTab)}
              onCancel={handleCancelOrder}
              onReorder={handleReorder}
              paymentMethods={paymentMethods}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
