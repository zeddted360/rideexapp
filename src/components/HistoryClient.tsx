"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import {
  fetchAdminNotifications,
  fetchUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/state/notificationSlice";
import { useAuth } from "@/context/authContext";
import { INotificationFetched, IUserFectched } from "../../types/types";
import { validateEnv } from "@/utils/appwrite";
import { databases } from "@/utils/appwrite";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  Search,
  Filter,
  Calendar,
  Bell,
  BellOff,
  Loader2,
  History as HistoryIcon,
  UserCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FilterType =
  | "all"
  | "admin_new_order"
  | "user_order_confirmation"
  | "order_status_update"
  | "delivery_update";
type StatusFilter = "all" | "read" | "unread";

const NOTIFICATION_TYPES = [
  { value: "all", label: "All Types", icon: Bell },
  { value: "admin_new_order", label: "New Orders", icon: Package },
  {
    value: "user_order_confirmation",
    label: "Order Confirmations",
    icon: CheckCircle,
  },
  { value: "order_status_update", label: "Status Updates", icon: Clock },
  { value: "delivery_update", label: "Delivery Updates", icon: Truck },
];

const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const PAGE_SIZE = 10; // Items per page

const HistoryClient = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId, isAuthenticated, user } = useAuth();
  const { adminNotifications, userNotifications, loading, error } = useSelector(
    (state: RootState) => state.notifications
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateRange, setDateRange] = useState<"all" | "7d" | "30d" | "90d">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] =
    useState<INotificationFetched | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState<
    string | null
  >(null);
  const [deletingIndividual, setDeletingIndividual] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const isAdmin = user?.role === "admin";
  const notifications = isAdmin ? adminNotifications : userNotifications;

  const getRiderCode = (orderId: string) => {
    if (!orderId) return "N/A";
    const lastFour = orderId.slice(-4).toUpperCase();
    return lastFour;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (isAdmin) {
          await dispatch(fetchAdminNotifications()).unwrap();
        } else if (userId) {
          await dispatch(fetchUserNotifications(userId)).unwrap();
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [dispatch, isAdmin, userId, isAuthenticated]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, typeFilter, statusFilter, dateRange]);

  const handleNotificationClick = async (
    notification: INotificationFetched
  ) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    // Fetch user details if userId exists
    if (notification.userId) {
      const userDetails = await fetchUserDetails(notification.userId);
      setSelectedUserDetails(userDetails);
    } else {
      setSelectedUserDetails(null);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleCloseModal = async () => {
    // Mark as read when closing the modal if it was unread
    if (selectedNotification && selectedNotification.status === "unread") {
      await handleMarkAsRead(selectedNotification.$id);
    }
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const handleIndividualDelete = async () => {
    if (deletingNotification) {
      setDeletingIndividual(true);
      try {
        await dispatch(deleteNotification(deletingNotification)).unwrap();
        setShowDeleteConfirm(false);
        setDeletingNotification(null);
        handleCloseModal();
      } catch (error) {
        console.error("Failed to delete notification:", error);
      } finally {
        setDeletingIndividual(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    setDeletingAll(true);
    try {
      await dispatch(
        deleteAllNotifications(isAdmin ? "admin" : (userId as string))
      ).unwrap();
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    } finally {
      setDeletingAll(false);
    }
  };

  const formatNotificationMessage = (notification: INotificationFetched) => {
    const riderCode = getRiderCode(notification.orderId);
    switch (notification.type) {
      case "admin_new_order":
        return {
          title: `New Order #${riderCode}`,
          description: `From ${notification.phone || "Customer"} • ${
            notification.address
          }`,
          amount: notification.totalAmount,
          items: notification.items,
        };
      case "user_order_confirmation":
        return {
          title: `Order Confirmed #${riderCode}`,
          description: `Delivery at ${notification.deliveryTime || "TBD"}`,
          amount: notification.totalAmount,
          items: notification.items,
        };
      case "order_status_update":
        return {
          title: `Order Status Updated`,
          description: `Order #${riderCode} status changed`,
          amount: notification.totalAmount,
          items: notification.items,
        };
      case "delivery_update":
        return {
          title: `Delivery Update`,
          description: `Order #${riderCode} • ${
            notification.deliveryDistance || ""
          } ${notification.deliveryDuration || ""}`.trim(),
          amount: notification.totalAmount,
          items: notification.items,
        };
      default:
        return {
          title: "Notification",
          description: "New notification received",
          amount: notification.totalAmount,
          items: notification.items,
        };
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      admin_new_order: Package,
      user_order_confirmation: CheckCircle,
      order_status_update: Clock,
      delivery_update: Truck,
    };
    return iconMap[type as keyof typeof iconMap] || Bell;
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === "unread" ? "destructive" : "secondary";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency in Nigerian Naira with proper styling
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Function to fetch user details by userId
  const fetchUserDetails = async (userId: string) => {
    if (!userId) return null;

    setLoadingUserDetails(true);
    try {
      const { databaseId, userCollectionId } = validateEnv();
      const response = await databases.getDocument(
        databaseId,
        userCollectionId,
        userId
      );
      return response as IUserFectched;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((notification) => {
        const message = formatNotificationMessage(notification);
        const riderCode = getRiderCode(notification.orderId);
        return (
          message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          notification.orderId
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          riderCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (notification) => notification.type === typeFilter
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (notification) => notification.status === statusFilter
      );
    }

    // Date range filter
    if (dateRange !== "all") {
      const days = parseInt(dateRange.replace("d", ""));
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      filtered = filtered.filter(
        (notification) => new Date(notification.createdAt) >= cutoffDate
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const filteredNotifications = filterNotifications();
  const totalPages = Math.ceil(filteredNotifications.length / PAGE_SIZE);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Authentication Required
              </h3>
              <p className="text-muted-foreground">
                Please log in to view your history.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HistoryIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">History</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="ml-auto flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete All ({notifications.length})
              </Button>
            )}
          </div>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Admin notifications and order history"
              : "Your order history and notifications"}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select
                value={typeFilter}
                onValueChange={(value: FilterType) => setTypeFilter(value)}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value: StatusFilter) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <BellOff className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Select
                value={dateRange}
                onValueChange={(value: typeof dateRange) => setDateRange(value)}
              >
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Loading history...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p>Error loading history</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No History Found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm ||
                      typeFilter !== "all" ||
                      statusFilter !== "all" ||
                      dateRange !== "all"
                        ? "No notifications match your current filters."
                        : "You have no notification history yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              paginatedNotifications.map((notification) => {
                const message = formatNotificationMessage(notification);
                const Icon = getNotificationIcon(notification.type);

                return (
                  <Card
                    key={notification.$id}
                    className={cn(
                      "transition-all duration-200 hover:shadow-md cursor-pointer",
                      notification.status === "unread" &&
                        "border-primary/50 bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "flex-shrink-0 p-2 rounded-full",
                            notification.status === "unread"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground truncate">
                                  {message.title}
                                </h3>
                                <Badge
                                  variant={getStatusBadgeVariant(
                                    notification.status
                                  )}
                                >
                                  {notification.status}
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {message.description}
                              </p>

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(notification.createdAt)}
                                </span>
                                {message.amount && (
                                  <span className="font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                    {formatCurrency(message.amount)}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  Click for details →
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && filteredNotifications.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {paginatedNotifications.length} of{" "}
            {filteredNotifications.length} notifications (Page {currentPage} of{" "}
            {totalPages})
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getNotificationIcon(selectedNotification.type);
                    return (
                      <div
                        className={cn(
                          "flex-shrink-0 p-2 rounded-full",
                          selectedNotification.status === "unread"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <DialogTitle className="text-left">
                      {formatNotificationMessage(selectedNotification).title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={getStatusBadgeVariant(
                          selectedNotification.status
                        )}
                      >
                        {selectedNotification.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(selectedNotification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <DialogDescription className="text-base">
                  {formatNotificationMessage(selectedNotification).description}
                </DialogDescription>

                {/* Customer Details */}
                {selectedUserDetails && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Name:
                        </span>
                        <p className="text-foreground">
                          {selectedUserDetails?.fullName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Phone:
                        </span>
                        <p className="text-foreground">
                          {selectedUserDetails?.phoneNumber ||
                            selectedNotification?.phone ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {loadingUserDetails && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading customer details...
                    </div>
                  </div>
                )}

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      Order Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Rider Code:</span>{" "}
                        {getRiderCode(selectedNotification.orderId)}
                      </div>
                      {selectedNotification.address && (
                        <div>
                          <span className="font-medium">Address:</span>{" "}
                          {selectedNotification.address}
                        </div>
                      )}
                      {selectedNotification.phone && (
                        <div>
                          <span className="font-medium">Phone:</span>{" "}
                          {selectedNotification.phone}
                        </div>
                      )}
                      {selectedNotification.deliveryTime && (
                        <div>
                          <span className="font-medium">Delivery Time:</span>{" "}
                          {selectedNotification.deliveryTime}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      Delivery Details
                    </h4>
                    <div className="space-y-1 text-sm">
                      {selectedNotification.deliveryDistance && (
                        <div>
                          <span className="font-medium">Distance:</span>{" "}
                          {selectedNotification.deliveryDistance}
                        </div>
                      )}
                      {selectedNotification.deliveryDuration && (
                        <div>
                          <span className="font-medium">Duration:</span>{" "}
                          {selectedNotification.deliveryDuration}
                        </div>
                      )}
                      {selectedNotification.deliveryFee && (
                        <div>
                          <span className="font-medium">Delivery Fee:</span>
                          <span className="font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded ml-1">
                            {formatCurrency(selectedNotification.deliveryFee)}
                          </span>
                        </div>
                      )}
                      {selectedNotification.totalAmount && (
                        <div>
                          <span className="font-medium">Total Amount:</span>
                          <span className="text-primary font-bold bg-primary/15 px-3 py-1 rounded-lg ml-2 text-lg">
                            {formatCurrency(selectedNotification.totalAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                {selectedNotification.items &&
                  selectedNotification.items.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                        Order Items
                      </h4>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                          {selectedNotification.items.map((item, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Additional Information */}
                {(selectedNotification.label ||
                  selectedNotification.selectedBranchId) && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      Additional Information
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                      {selectedNotification.label && (
                        <div>
                          <span className="font-medium">Address Label:</span>{" "}
                          {selectedNotification.label}
                        </div>
                      )}
                      {selectedNotification.selectedBranchId && (
                        <div>
                          <span className="font-medium">Branch ID:</span>{" "}
                          {selectedNotification.selectedBranchId}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleCloseModal}>
                  {selectedNotification.status === "unread"
                    ? "Mark as Read & Close"
                    : "Close"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeletingNotification(selectedNotification.$id);
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Individual Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletingIndividual}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleIndividualDelete}
              disabled={deletingIndividual}
            >
              {deletingIndividual ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Notification"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog
        open={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete All</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all {notifications.length}{" "}
              notifications? This action cannot be undone and will remove your
              entire history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteConfirm(false)}
              disabled={deletingAll}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={deletingAll}
            >
              {deletingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete All Notifications"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryClient;
