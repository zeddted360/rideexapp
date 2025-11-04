"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  X,
  Package,
  Clock,
  MapPin,
  User,
  CreditCard,
  ShoppingBag,
  Receipt,
  Copy,
  Check,
  Phone,
  Truck,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  IBookedOrderFetched,
  IDiscountFetched,
  IFeaturedItemFetched,
  IMenuItemFetched,
  IPopularItemFetched,
  IUserFectched,
  OrderStatus,
  IPackFetched,
  IRestaurantFetched,
  IPromoOfferFetched,
} from "../../types/types";
import { databases, fileUrl, validateEnv } from "@/utils/appwrite";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import { listAsyncFeaturedItems } from "@/state/featuredSlice";
import { listAsyncMenusItem } from "@/state/menuSlice";
import { listAsyncPopularItems } from "@/state/popularSlice";
import { listAsyncDiscounts } from "@/state/discountSlice"; // Add this import
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { IFetchedExtras } from "../../types/types";
import toast from "react-hot-toast";
import { cancelBookedOrder } from "@/state/bookedOrdersSlice";
import { Query } from "appwrite";
import { listAsyncPromoOfferItems } from "@/state/offerSlice";

interface OrdersTabProps {
  orders: IBookedOrderFetched[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: OrderStatus | "all";
  setStatusFilter: (status: OrderStatus | "all") => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredOrders: IBookedOrderFetched[];
  ordersPerPage: number;
  handleStatusChange: (
    orderId: string,
    newStatus: OrderStatus
  ) => Promise<void>;
  ORDER_STATUSES: string[];
  branches: any[];
}

interface ItemWithBucket {
  item: any;
  bucketId: string | null;
}

interface StructuredItem {
  itemId: string;
  quantity: number;
  extrasIds: string[];
  priceAtOrder: number;
}

interface ParsedExtra {
  extraId: string;
  quantity: number;
}

interface BranchDistance {
  address: string;
  distanceText: string;
  distanceValue: number;
  durationText: string;
}

function cleanAddress(address: string): string {
  let cleaned = address.trim().replace(/\s+/g, " ");
  if (!cleaned.toLowerCase().includes("nigeria")) {
    cleaned += ", Nigeria";
  }
  return cleaned;
}

export default function OrdersTab({
  orders,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  filteredOrders,
  ordersPerPage,
  handleStatusChange,
  ORDER_STATUSES,
  branches,
}: OrdersTabProps) {
  const dispatch = useDispatch<AppDispatch>();

  const menuItems = useSelector((state: RootState) => state.menuItem.menuItems);
  const featuredItems = useSelector(
    (state: RootState) => state.featuredItem.featuredItems
  );
  const popularItems = useSelector(
    (state: RootState) => state.popularItem.popularItems
  );
  const {discounts} = useSelector(
    (state: RootState) => state.discounts
  );
  const {offersItem} = useSelector(
    (state: RootState) => state.promoOffer
  ); // Assuming promoSlice with promoOffers

  const [customerNames, setCustomerNames] = useState<{ [key: string]: string }>(
    {}
  );
  const [fetchingNames, setFetchingNames] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<IBookedOrderFetched | null>(null);
  const [selectedOrderToDelete, setSelectedOrderToDelete] =
    useState<IBookedOrderFetched | null>(null);
  const [fetchedExtras, setFetchedExtras] = useState<{
    [key: string]: IFetchedExtras | IPackFetched;
  }>({});
  const [fetchingExtras, setFetchingExtras] = useState(false);
  const [structuredItems, setStructuredItems] = useState<StructuredItem[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [fetchedRestos, setFetchedRestos] = useState<{
    [id: string]: IRestaurantFetched;
  }>({});
  const [branchDistances, setBranchDistances] = useState<{
    [restoId: string]: BranchDistance[];
  }>({});
  const [fetchingDistances, setFetchingDistances] = useState(false);

  useEffect(() => {
    dispatch(listAsyncFeaturedItems());
    dispatch(listAsyncMenusItem());
    dispatch(listAsyncPopularItems());
    dispatch(listAsyncDiscounts()); 
    dispatch(listAsyncPromoOfferItems());
  }, [dispatch]);

  const findItemById = (id: string): ItemWithBucket => {
    let item:
      | IMenuItemFetched
      | IFeaturedItemFetched
      | IPopularItemFetched
      | IDiscountFetched
      | IPromoOfferFetched
      | undefined = menuItems.find((item) => item.$id === id);
    if (item) {
      return { item, bucketId: validateEnv().menuBucketId };
    }
    item = featuredItems.find((item) => item.$id === id);
    if (item) {
      return { item, bucketId: validateEnv().featuredBucketId };
    }
    item = popularItems.find((item) => item.$id === id);
    if (item) {
      return { item, bucketId: validateEnv().popularBucketId };
    }
    item = discounts.find((item) => item.$id === id);
    if (item) {
      return { item, bucketId: validateEnv().discountBucketId };
    }
    item = offersItem.find((item) => item.$id === id);
    if (item) {
      return { item, bucketId: validateEnv().promoOfferBucketId };
    }
    // Default return if no item is found
    return { item: null, bucketId: null };
  };
  
  const fetchCustomerName = async (customerId: string) => {
    if (customerId && !customerNames[customerId]) {
      try {
        const response = (await databases.getDocument(
          validateEnv().databaseId,
          validateEnv().userCollectionId,
          customerId
        )) as IUserFectched;

        setCustomerNames((prev) => ({
          ...prev,
          [customerId]: response.fullName as string,
        }));
      } catch (err) {
        console.error(
          err instanceof Error ? err.message : "Error fetching customer name"
        );
        setCustomerNames((prev) => ({
          ...prev,
          [customerId]: "Unknown Customer",
        }));
      }
    }
  };

  useEffect(() => {
    if (orders.length > 0 && !fetchingNames) {
      setFetchingNames(true);
      const uniqueCustomerIds = [
        ...new Set(orders.map((order) => order.customerId)),
      ];
      uniqueCustomerIds.forEach(fetchCustomerName);
      setFetchingNames(false);
    }
  }, [orders]);

  useEffect(() => {
    if (selectedOrder && selectedOrder.items) {
      try {
        const parsedItems = selectedOrder.items.map((itemStr: string) =>
          JSON.parse(itemStr)
        ) as StructuredItem[];
        setStructuredItems(parsedItems);

        setFetchingExtras(true);
        const extraIds = new Set<string>();
        parsedItems.forEach((structuredItem) => {
          structuredItem.extrasIds.forEach((extraIdStr: string) => {
            const [extraId] = extraIdStr.split("_");
            if (extraId) {
              extraIds.add(extraId);
            }
          });
        });

        const extraIdsToFetch = Array.from(extraIds).filter(
          (id) => !fetchedExtras[id]
        );
        if (extraIdsToFetch.length === 0) {
          setFetchingExtras(false);
        } else {
          const fetchExtrasAndPacks = async () => {
            try {
              const { databaseId, extrasCollectionId, packsCollectionId } =
                validateEnv();

              // Fetch from extras collection
              const extrasResponse = await databases.listDocuments(
                databaseId,
                extrasCollectionId,
                [Query.equal("$id", extraIdsToFetch)]
              );
              const fetchedExtrasArr: IFetchedExtras[] =
                extrasResponse.documents as IFetchedExtras[];

              // Fetch from packs collection
              const packsResponse = await databases.listDocuments(
                databaseId,
                packsCollectionId,
                [Query.equal("$id", extraIdsToFetch)]
              );
              const fetchedPacks: IPackFetched[] =
                packsResponse.documents as IPackFetched[];

              // Combine them
              const newExtrasAndPacks: {
                [key: string]: IFetchedExtras | IPackFetched;
              } = {};
              [...fetchedExtrasArr, ...fetchedPacks].forEach((doc) => {
                newExtrasAndPacks[doc.$id] = doc;
              });

              setFetchedExtras((prev) => ({ ...prev, ...newExtrasAndPacks }));
            } catch (error) {
              console.error("Failed to fetch extras and packs:", error);
            } finally {
              setFetchingExtras(false);
            }
          };

          fetchExtrasAndPacks();
        }

        // Fetch restaurants and distances
        const fetchRestosAndDistances = async () => {
          const restoIdsSet = new Set<string>();
          parsedItems.forEach((struc) => {
            const { item } = findItemById(struc.itemId);
            if (item?.restaurantId) restoIdsSet.add(item.restaurantId);
          });
          const restoIds = Array.from(restoIdsSet);

          if (restoIds.length === 0) return;

          const { databaseId, restaurantsCollectionId } = validateEnv();
          const restos: { [id: string]: IRestaurantFetched } = {};
          for (const id of restoIds) {
            try {
              restos[id] = (await databases.getDocument(
                databaseId,
                restaurantsCollectionId,
                id
              )) as IRestaurantFetched;
            } catch (err) {
              console.error(`Failed to fetch restaurant ${id}:`, err);
            }
          }
          setFetchedRestos(restos);

          if (!selectedOrder.address || Object.keys(restos).length === 0)
            return;

          setFetchingDistances(true);
          try {
            const cleanDest = cleanAddress(selectedOrder.address);
            const allOrigins: string[] = [];
            const restoBranchMap: {
              [index: number]: { restoId: string; branchIndex: number };
            } = {};

            Object.entries(restos).forEach(([restoId, resto]) => {
              (resto.addresses || []).forEach(
                (addr: string, branchIdx: number) => {
                  const cleanAddr = cleanAddress(addr);
                  const currentIndex = allOrigins.length;
                  allOrigins.push(cleanAddr);
                  restoBranchMap[currentIndex] = {
                    restoId,
                    branchIndex: branchIdx,
                  };
                }
              );
            });

            if (allOrigins.length === 0) return;

            const response = await fetch(
              `/api/distance-matrix?origins=${allOrigins
                .map(encodeURIComponent)
                .join("|")}&destinations=${encodeURIComponent(cleanDest)}`
            );
            const data = await response.json();

            if (data.status !== "OK") {
              console.error("Distance Matrix failed:", data);
              return;
            }

            const distances: { [restoId: string]: BranchDistance[] } = {};
            data.rows.forEach((row: any, i: number) => {
              const el = row.elements[0];
              if (el.status === "OK") {
                const { restoId, branchIndex } = restoBranchMap[i];
                if (!distances[restoId]) distances[restoId] = [];
                distances[restoId].push({
                  address: allOrigins[i],
                  distanceText: el.distance.text,
                  distanceValue: el.distance.value,
                  durationText: el.duration.text,
                });
              }
            });

            // Sort each restaurant's branches by distance
            Object.keys(distances).forEach((restoId) => {
              distances[restoId].sort(
                (a, b) => a.distanceValue - b.distanceValue
              );
            });

            setBranchDistances(distances);
          } catch (err) {
            console.error("Failed to calculate distances:", err);
          } finally {
            setFetchingDistances(false);
          }
        };

        fetchRestosAndDistances();
      } catch (err) {
        console.error("Failed to parse structured items:", err);
        setStructuredItems([]);
        setFetchingExtras(false);
      }
    }
  }, [selectedOrder]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = async (orderId: string) => {
    setIsDeleting(true);
    try {
      await dispatch(cancelBookedOrder(orderId)).unwrap();
      toast.success("Order deleted successfully");
      setSelectedOrderToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
      confirmed:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      preparing:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
      ready:
        "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
      out_for_delivery:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
      delivered:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
      cancelled:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800"
    );
  };

  const deliveryFee = selectedOrder?.deliveryFee || 333;
  const deliveryTime = selectedOrder?.deliveryTime;
  const deliveryAddress = selectedOrder?.address;
  const deliverContact = selectedOrder?.phone;

  // Helper function to parse extraId_quantity strings
  const parseExtraId = (extraIdStr: string): ParsedExtra => {
    const [extraId, quantityStr] = extraIdStr.split("_");
    return {
      extraId,
      quantity: parseInt(quantityStr, 10) || 1, // Default to 1 if parsing fails
    };
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Order Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and track all customer orders
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm">
            <ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="font-bold text-gray-900 dark:text-white">
              {filteredOrders.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Orders
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by order ID, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-all"
            />
          </div>
          <div className="relative sm:w-64">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={20}
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "all")
              }
              className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 appearance-none transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={20}
            />
          </div>
        </div>
      </div>

      {/* Orders Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-semibold text-center">
            {error}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <table className="min-w-full bg-white dark:bg-gray-800">
              <thead className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => {
                    const branch = branches.find(
                      (b) => b.id === order.selectedBranchId
                    );
                    const customerName =
                      customerNames[order.customerId] ||
                      (fetchingNames ? "Loading..." : "Unknown Customer");
                    return (
                      <tr
                        key={order.$id}
                        className="hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                            #{order.riderCode?.toUpperCase() || order.orderId}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {branch ? branch.name : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {customerName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order.$id,
                                e.target.value as OrderStatus
                              )
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-semibold border-2 focus:ring-2 focus:ring-orange-400 transition-all cursor-pointer ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                              order.paid
                                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                                : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            {order.paid ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                              aria-label="View order details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setSelectedOrderToDelete(order)}
                              className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              aria-label="Delete order"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          No orders found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => {
                const branch = branches.find(
                  (b) => b.id === order.selectedBranchId
                );
                const customerName =
                  customerNames[order.customerId] ||
                  (fetchingNames ? "Loading..." : "Unknown Customer");
                return (
                  <div
                    key={order.$id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="font-mono font-bold text-orange-600 dark:text-orange-400 text-lg">
                          #{order.riderCode?.toUpperCase() || order.orderId}
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                              order.paid
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            <CreditCard className="w-3 h-3" />
                            {order.paid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                          aria-label="View order details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedOrderToDelete(order)}
                          className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          aria-label="Delete order"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Branch:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {branch ? branch.name : "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Customer:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Created:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 text-xs">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Order Status
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.$id,
                            e.target.value as OrderStatus
                          )
                        }
                        className={`w-full rounded-xl px-4 py-3 text-sm font-semibold border-2 focus:ring-2 focus:ring-orange-400 transition-all cursor-pointer ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <Package className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium text-center">
                  No orders found
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-1">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredOrders.length > ordersPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                Previous
              </Button>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Page{" "}
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-bold">
                  {Math.ceil(filteredOrders.length / ordersPerPage)}
                </span>
              </span>
              <Button
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      currentPage + 1,
                      Math.ceil(filteredOrders.length / ordersPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredOrders.length / ordersPerPage)
                }
                className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => {
          setSelectedOrder(null);
          setCopiedField(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-0 sm:max-w-4xl">
          <DialogHeader className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Order #{selectedOrder?.riderCode?.toUpperCase()}
              </DialogTitle>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                  selectedOrder?.paid
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                {selectedOrder?.paid ? "Paid" : "Unpaid"}
              </span>
            </div>
          </DialogHeader>

          <div className="space-y-6 p-4 sm:p-6">
            {/* Delivery Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-5 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Delivery Information
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Delivery Address
                  </label>
                  <div className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                      {deliveryAddress || "No address provided"}
                    </p>
                    <button
                      onClick={() =>
                        deliveryAddress &&
                        handleCopy(deliveryAddress, "Address")
                      }
                      className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      aria-label="Copy address"
                    >
                      {copiedField === "Address" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Contact Number
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {deliverContact || "N/A"}
                    </p>
                    <button
                      onClick={() =>
                        deliverContact && handleCopy(deliverContact, "Contact")
                      }
                      className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      aria-label="Copy contact"
                    >
                      {copiedField === "Contact" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Delivery Time */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Delivery Time
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {deliveryTime || "ASAP"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 p-4 sm:p-5 rounded-2xl border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Order Summary
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-x-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Items:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {structuredItems.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Qty:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {structuredItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    Delivery Fee:
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    ₦{deliveryFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center col-span-2 pt-3 border-t-2 border-orange-300 dark:border-orange-700">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Grand Total:
                  </span>
                  <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                    ₦{selectedOrder?.total?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {fetchingExtras ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Loading order details...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  Order Items ({structuredItems.length})
                </h3>
                {structuredItems.map((structuredItem, itemIndex) => {
                  const { item, bucketId } = findItemById(
                    structuredItem.itemId
                  );

                  if (!item) {
                    return (
                      <div
                        key={itemIndex}
                        className="p-5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl border-2 border-red-200 dark:border-red-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              Item Not Found
                            </h4>
                            <p className="text-sm text-red-500">
                              ID: {structuredItem.itemId}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Parse extrasIds to extract extraId and quantity
                  const parsedExtras =
                    structuredItem.extrasIds.map(parseExtraId);

                  const itemSubtotal =
                    structuredItem.priceAtOrder * structuredItem.quantity;
                  const extrasSubtotal = parsedExtras.reduce(
                    (sum, parsedExtra) => {
                      const extra = fetchedExtras[parsedExtra.extraId];
                      if (extra) {
                        return sum + +extra.price * parsedExtra.quantity;
                      }
                      return sum;
                    },
                    0
                  );
                  const lineTotal = itemSubtotal + extrasSubtotal;

                  return (
                    <div
                      key={itemIndex}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {/* Item Header */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                            {bucketId && item.image ? (
                              <Image
                                src={fileUrl(bucketId, item.image)}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-2">
                              {item.name || item.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {item.description || "No description available"}
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-semibold">
                                Qty: {structuredItem.quantity}
                              </span>
                              <span className="text-base font-bold text-orange-600 dark:text-orange-400">
                                ₦{structuredItem.priceAtOrder.toLocaleString()}{" "}
                                each
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-lg sm:text-xl font-black text-gray-900 dark:text-white block sm:inline-block">
                              ₦{itemSubtotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Extras Section */}
                      {parsedExtras.length > 0 && (
                        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-t-2 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                              Extras ({parsedExtras.length})
                            </h5>
                          </div>
                          <div className="space-y-3">
                            {parsedExtras.map((parsedExtra, extraIndex) => {
                              const extra = fetchedExtras[parsedExtra.extraId];
                              const extraQty = parsedExtra.quantity;
                              const extraTotal = extra
                                ? +extra.price * extraQty
                                : 0;
                              return extra ? (
                                <div
                                  key={extraIndex}
                                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm"
                                >
                                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-lg overflow-hidden">
                                    {extra.image ? (
                                      <Image
                                        src={fileUrl(
                                          validateEnv().extrasBucketId,
                                          extra.image
                                        )}
                                        alt={extra.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 flex items-center justify-center">
                                        <Package className="w-5 h-5 text-orange-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                      {extra.name}
                                    </h6>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 block">
                                      ₦{extra.price.toLocaleString()} ×{" "}
                                      {extraQty}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                                      = ₦{extraTotal.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  key={extraIndex}
                                  className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-xl text-center border border-gray-300 dark:border-gray-600"
                                >
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Extra not found (ID: {parsedExtra.extraId})
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          {parsedExtras.length > 0 && (
                            <div className="mt-4 pt-3 border-t-2 border-indigo-200 dark:border-indigo-800 flex justify-between items-center">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                Extras Subtotal:
                              </span>
                              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                ₦{extrasSubtotal.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Line Total */}
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-pink-500 flex justify-between items-center">
                        <span className="text-sm font-bold text-white">
                          Item Total:
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-white">
                          ₦{lineTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Restaurant Branches Section */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Restaurant Branches
              </h3>
              {fetchingDistances ? (
                <div className="flex items-center justify-center py-4">
                  <Package className="w-6 h-6 animate-spin text-orange-500 mr-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Calculating distances...
                  </p>
                </div>
              ) : Object.keys(fetchedRestos).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No restaurants found for this order
                </p>
              ) : (
                Object.entries(fetchedRestos).map(([restoId, resto]) => (
                  <div
                    key={restoId}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {resto.name}
                    </h4>
                    {branchDistances[restoId]?.length > 0 ? (
                      <select
                        defaultValue={
                          branchDistances[restoId][0]?.address || ""
                        }
                        className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-orange-500 dark:focus:border-orange-500 transition-all"
                      >
                        {branchDistances[restoId].map((branch, i) => (
                          <option key={i} value={branch.address}>
                            {branch.address} - {branch.distanceText} (
                            {i === 0 ? "closest" : ""})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No branch distances available
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Grand Total Footer - Mobile Friendly Bottom Placement */}
            <div className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 p-4 rounded-2xl sticky bottom-0 z-10 sm:static sm:mt-0">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900 dark:text-white">
                  Grand Total
                </span>
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  ₦{selectedOrder?.total?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 sm:pt-0">
            <DialogClose asChild>
              <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!selectedOrderToDelete}
        onOpenChange={() => setSelectedOrderToDelete(null)}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
          <DialogHeader className="p-6">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete order #
              {selectedOrderToDelete?.riderCode?.toUpperCase() ||
                selectedOrderToDelete?.orderId}
              ? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="p-6 pt-0 gap-3">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-gray-200 dark:border-gray-700"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() =>
                selectedOrderToDelete && handleDelete(selectedOrderToDelete.$id)
              }
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
            >
              {isDeleting ? "Deleting..." : "Delete Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
