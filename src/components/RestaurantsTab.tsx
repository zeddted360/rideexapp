// components/RestaurantsTab.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { validateEnv, storage } from "@/utils/appwrite";
import {
  createAsyncRestaurant,
  deleteAsyncRestaurant,
  updateAsyncRestaurant,
  toggleRestaurantStatusAsync,
} from "@/state/restaurantSlice";
import { listAsyncVendors } from "@/state/vendorSlice";
import toast from "react-hot-toast";
import {
  Search,
  Edit3,
  Trash2,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  PlusCircle,
  Upload,
  Star,
  Building2,
  Clock,
  Pause,
  Play,
} from "lucide-react";
import {
  IRestaurantFetched,
  IRestaurant,
  IVendorFetched,
  IScheduleDay,
} from "../../types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RestaurantFormData, restaurantSchema } from "@/utils/schema";

interface RestaurantsTabProps {
  restaurants: IRestaurantFetched[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredRestaurants: IRestaurantFetched[];
  restaurantsPerPage: number;
}

const categories = [
  { value: "African", label: "African" },
  { value: "Bakery", label: "Bakery" },
  { value: "Chinese", label: "Chinese" },
  { value: "Fast food", label: "Fast food" },
  { value: "Grill", label: "Grill" },
  { value: "Healthy", label: "Healthy" },
  { value: "Premium", label: "Premium" },
  { value: "Snacks", label: "Snacks" },
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const defaultSchedule: IScheduleDay[] = daysOfWeek.map((day) => ({
  day: day as IScheduleDay["day"],
  openTime: "08:00",
  closeTime: "21:00",
  isClosed: false,
}));

const defaultAddresses = ["", "", ""];

export default function RestaurantsTab({
  restaurants,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  filteredRestaurants,
  restaurantsPerPage,
}: RestaurantsTabProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { restaurantBucketId } = validateEnv();

  const { vendors, loading: vendorsLoading } = useSelector(
    (state: RootState) => state.vendors
  );

  // Fetch vendors on mount
  useEffect(() => {
    dispatch(listAsyncVendors());
  }, [dispatch]);

  // Helper function to get vendor business name
  const getVendorBusinessName = (vendorId: string) => {
    const vendor = vendors.find((v: IVendorFetched) => v.$id === vendorId);
    return vendor ? vendor.businessName : "N/A";
  };

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [editingRestaurant, setEditingRestaurant] =
    useState<IRestaurantFetched | null>(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    rating: 0,
    deliveryTime: "",
    category: "",
    vendorId: "",
    logo: "",
    addresses: defaultAddresses,
  });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Add Restaurant Form
  const addForm = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      rating: 0,
      deliveryTime: "",
      category: "",
      logo: undefined,
      vendorId: "",
      schedule: defaultSchedule,
      addresses: defaultAddresses,
    },
    mode: "onChange",
  });

  // Watch logo field for preview
  const logoFile = addForm.watch("logo");

  useEffect(() => {
    if (logoFile && logoFile[0]) {
      const file = logoFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file as File);
    } else {
      setLogoPreview(null);
    }
  }, [logoFile]);

  const { watch, setValue } = addForm;
  const schedule = watch("schedule");

  const handleIsClosedChange = (index: number, checked: boolean) => {
    setValue(`schedule.${index}.isClosed`, checked);
    if (checked) {
      setValue(`schedule.${index}.openTime`, null);
      setValue(`schedule.${index}.closeTime`, null);
    } else {
      setValue(`schedule.${index}.openTime`, "08:00");
      setValue(`schedule.${index}.closeTime`, "21:00");
    }
  };

  useEffect(() => {
    schedule.forEach((day, index) => {
      if (day.isClosed && (day.openTime !== null || day.closeTime !== null)) {
        setValue(`schedule.${index}.openTime`, null);
        setValue(`schedule.${index}.closeTime`, null);
      } else if (!day.isClosed && (!day.openTime || !day.closeTime)) {
        setValue(`schedule.${index}.openTime`, day.openTime || "08:00");
        setValue(`schedule.${index}.closeTime`, day.closeTime || "21:00");
      }
    });
  }, [schedule, setValue]);

  useEffect(() => {
    if (editingRestaurant) {
      setEditFormData({
        name: editingRestaurant.name,
        rating: editingRestaurant.rating,
        deliveryTime: editingRestaurant.deliveryTime,
        category: editingRestaurant.category,
        vendorId: editingRestaurant.vendorId || "",
        logo: "",
        addresses:
          editingRestaurant.addresses.length >= 3
            ? editingRestaurant.addresses
            : [
                ...editingRestaurant.addresses,
                ...Array(3 - editingRestaurant.addresses.length).fill(""),
              ],
      });
    }
  }, [editingRestaurant]);

  const handleAddRestaurantSubmit = async (data: RestaurantFormData) => {
    setFormLoading(true);
    try {
      const processedSchedule: IScheduleDay[] = data.schedule.map((day) => ({
        day: day.day,
        openTime: day.openTime ?? null,
        closeTime: day.closeTime ?? null,
        isClosed: day.isClosed,
      }));

      // Filter out empty addresses
      const processedAddresses = data.addresses.filter(
        (addr) => addr.trim() !== ""
      );

      const restaurantData: IRestaurant = {
        name: data.name,
        logo: data.logo as FileList,
        rating: data.rating,
        deliveryTime: data.deliveryTime,
        category: data.category,
        vendorId: data.vendorId,
        schedule: processedSchedule,
        addresses: processedAddresses,
      };
      await dispatch(createAsyncRestaurant(restaurantData)).unwrap();
      addForm.reset();
      setLogoPreview(null);
      setAddModalOpen(false);
    } catch (error) {
      toast.error("Failed to add restaurant");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (restaurant: IRestaurantFetched) => {
    setEditingRestaurant(restaurant);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (restaurantId: string, restaurantName: string) => {
    setDeletingRestaurant({ id: restaurantId, name: restaurantName });
    setDeleteModalOpen(true);
  };

  const handleToggleStatus = async (restaurantId: string) => {
    setTogglingId(restaurantId);
    try {
      await dispatch(toggleRestaurantStatusAsync(restaurantId)).unwrap();
    } catch (error) {
      toast.error("Failed to toggle restaurant status");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingRestaurant) return;

    setDeleting(true);
    try {
      await dispatch(deleteAsyncRestaurant(deletingRestaurant.id)).unwrap();
      setDeleteModalOpen(false);
      setDeletingRestaurant(null);
    } catch (err) {
      toast.error("Failed to delete restaurant");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!editingRestaurant) return;

    setUpdating(true);
    try {
      // Filter out empty addresses
      const processedAddresses = editFormData.addresses.filter(
        (addr) => addr.trim() !== ""
      );

      await dispatch(
        updateAsyncRestaurant({
          id: editingRestaurant.$id,
          data: {
            ...editFormData,
            addresses: processedAddresses,
          },
        })
      ).unwrap();
      setEditModalOpen(false);
      setEditingRestaurant(null);
    } catch (err) {
      toast.error("Failed to update restaurant");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...editFormData.addresses];
    newAddresses[index] = value;
    setEditFormData({ ...editFormData, addresses: newAddresses });
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    addForm.reset();
    setLogoPreview(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingRestaurant(null);
  };

  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }

    return pages;
  };

  if (loading === "pending" || vendorsLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-orange-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-1">
                Error Loading Restaurants
              </h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by restaurant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-white">
              {filteredRestaurants.length}
            </span>
            <span>
              {filteredRestaurants.length === 1 ? "restaurant" : "restaurants"}
            </span>
          </div>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm px-4 py-2.5"
          >
            <PlusCircle className="w-4 h-4" />
            Add Restaurant
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredRestaurants.length > 0 ? (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Main Address
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {restaurants.map((restaurant) => (
                    <tr
                      key={restaurant.$id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                            {!imageError[restaurant.$id] ? (
                              <img
                                src={storage.getFilePreview(
                                  restaurantBucketId,
                                  restaurant.logo as unknown as string,
                                  128,
                                  128
                                )}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                                onError={() => {
                                  setImageError((prev) => ({
                                    ...prev,
                                    [restaurant.$id]: true,
                                  }));
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs font-medium">
                                {restaurant.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {restaurant.name}
                              </p>
                              {restaurant.isPaused && (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
                                  Paused
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                            {restaurant.vendorId
                              ? getVendorBusinessName(restaurant.vendorId)
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {restaurant.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {restaurant.rating.toFixed(1)}
                          </span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {restaurant.deliveryTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {restaurant.addresses?.[0] || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(restaurant.$id)}
                            disabled={togglingId === restaurant.$id}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                              restaurant.isPaused
                                ? "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                                : "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={
                              restaurant.isPaused
                                ? "Resume restaurant"
                                : "Pause restaurant"
                            }
                            aria-label={
                              restaurant.isPaused
                                ? "Resume restaurant"
                                : "Pause restaurant"
                            }
                          >
                            {togglingId === restaurant.$id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : restaurant.isPaused ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Pause className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditClick(restaurant)}
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit restaurant"
                            aria-label="Edit restaurant"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(restaurant.$id, restaurant.name)
                            }
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete restaurant"
                            aria-label="Delete restaurant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {(currentPage - 1) * restaurantsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.min(
                    currentPage * restaurantsPerPage,
                    filteredRestaurants.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {filteredRestaurants.length}
                </span>{" "}
                results
              </div>
              <nav className="flex items-center gap-2" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      className={`inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={index}
                      className="inline-flex items-center justify-center min-w-[2.25rem] h-9 text-gray-500 dark:text-gray-400"
                    >
                      {page}
                    </span>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No restaurants found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm
              ? `No results for "${searchTerm}". Try adjusting your search.`
              : "Get started by adding your first restaurant."}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white mx-auto"
            >
              <PlusCircle className="w-4 h-4" />
              Add Your First Restaurant
            </Button>
          )}
        </div>
      )}

      {/* Add Restaurant Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add New Restaurant
                </h3>
              </div>
              <button
                onClick={handleCloseAddModal}
                disabled={formLoading}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <form onSubmit={addForm.handleSubmit(handleAddRestaurantSubmit)}>
                <div className="space-y-6">
                  {/* Logo Upload */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Restaurant Logo
                    </Label>
                    <div className="flex items-start gap-4">
                      <label className="flex-1 group cursor-pointer">
                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-orange-500 dark:hover:border-orange-500 transition-all bg-gray-50 dark:bg-gray-900/50 hover:bg-orange-50 dark:hover:bg-orange-900/10">
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            {...addForm.register("logo")}
                          />
                          <div className="flex flex-col items-center justify-center text-center">
                            <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 group-hover:text-orange-500 mb-3 transition-colors" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>
                      </label>
                      {logoPreview && (
                        <div className="flex-shrink-0">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                addForm.setValue("logo", undefined);
                                setLogoPreview(null);
                              }}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {addForm.formState.errors.logo && (
                      <p className="text-red-500 text-sm mt-2">
                        {addForm.formState.errors.logo.message}
                      </p>
                    )}
                  </div>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label
                        htmlFor="add-name"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
                      >
                        Restaurant Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="add-name"
                        {...addForm.register("name")}
                        placeholder="e.g., Mama's Kitchen"
                        className="h-11 focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                      />
                      {addForm.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1.5">
                          {addForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="add-category"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
                      >
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="add-category"
                        {...addForm.register("category")}
                        className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow appearance-none"
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      {addForm.formState.errors.category && (
                        <p className="text-red-500 text-sm mt-1.5">
                          {addForm.formState.errors.category.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="add-vendor"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
                      >
                        Vendor <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="add-vendor"
                        {...addForm.register("vendorId")}
                        className="w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow appearance-none"
                      >
                        <option value="">Select vendor</option>
                        {vendors
                          .filter((ven) => ven.status === "approved")
                          .map((vendor: IVendorFetched) => (
                            <option key={vendor.$id} value={vendor.$id}>
                              {vendor.businessName}
                            </option>
                          ))}
                      </select>
                      {addForm.formState.errors.vendorId && (
                        <p className="text-red-500 text-sm mt-1.5">
                          {addForm.formState.errors.vendorId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="add-rating"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5"
                      >
                        Rating <span className="text-red-500">*</span>
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      </Label>
                      <Input
                        id="add-rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        {...addForm.register("rating", { valueAsNumber: true })}
                        placeholder="4.5"
                        className="h-11 focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                      />
                      {addForm.formState.errors.rating && (
                        <p className="text-red-500 text-sm mt-1.5">
                          {addForm.formState.errors.rating.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="add-deliveryTime"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
                      >
                        Delivery Time <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="add-deliveryTime"
                        {...addForm.register("deliveryTime")}
                        placeholder="e.g., 30-40 min"
                        className="h-11 focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                      />
                      {addForm.formState.errors.deliveryTime && (
                        <p className="text-red-500 text-sm mt-1.5">
                          {addForm.formState.errors.deliveryTime.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Addresses Section */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Addresses <span className="text-red-500">*</span>
                    </Label>
                    <div className="space-y-3">
                      {["Main Branch", "Branch 1", "Branch 2"].map(
                        (label, index) => (
                          <div key={index}>
                            <Label
                              htmlFor={`addresses.${index}`}
                              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
                            >
                              {label}{" "}
                              {index === 0 && (
                                <span className="text-red-500">*</span>
                              )}
                            </Label>
                            <Input
                              id={`addresses.${index}`}
                              {...addForm.register(`addresses.${index}`)}
                              placeholder={`e.g., ${label} Address`}
                              className="h-11 focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                            />
                            {addForm.formState.errors.addresses?.[index] && (
                              <p className="text-red-500 text-sm mt-1.5">
                                {
                                  addForm.formState.errors.addresses[index]
                                    ?.message
                                }
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                    {addForm.formState.errors.addresses &&
                      !Array.isArray(addForm.formState.errors.addresses) && (
                        <p className="text-red-500 text-sm mt-2">
                          {addForm.formState.errors.addresses.message}
                        </p>
                      )}
                  </div>

                  {/* Operating Hours */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Operating Hours <span className="text-red-500">*</span>
                    </Label>
                    <div className="space-y-4">
                      {daysOfWeek.map((day, index) => {
                        const isClosed = watch(`schedule.${index}.isClosed`);
                        return (
                          <div
                            key={day}
                            className={`p-4 rounded-lg border transition-all duration-200 ${
                              isClosed
                                ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                : "bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30"
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                              <div className="w-28 flex-shrink-0">
                                <Label className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                  {day}
                                </Label>
                              </div>
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <Label
                                    htmlFor={`schedule[${index}].openTime`}
                                    className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block"
                                  >
                                    Open Time
                                  </Label>
                                  <Input
                                    id={`schedule[${index}].openTime`}
                                    type="time"
                                    {...addForm.register(
                                      `schedule.${index}.openTime`
                                    )}
                                    disabled={isClosed}
                                    className={`h-10 border-gray-300 dark:border-gray-600 transition-colors ${
                                      !isClosed &&
                                      "focus:border-orange-500 focus:ring-orange-500"
                                    }`}
                                  />
                                  {addForm.formState.errors.schedule?.[index]
                                    ?.openTime && (
                                    <p className="text-red-500 text-xs mt-1.5 font-medium">
                                      {
                                        addForm.formState.errors.schedule[index]
                                          ?.openTime?.message
                                      }
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`schedule[${index}].closeTime`}
                                    className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block"
                                  >
                                    Close Time
                                  </Label>
                                  <Input
                                    id={`schedule[${index}].closeTime`}
                                    type="time"
                                    {...addForm.register(
                                      `schedule.${index}.closeTime`
                                    )}
                                    disabled={isClosed}
                                    className={`h-10 border-gray-300 dark:border-gray-600 transition-colors ${
                                      !isClosed &&
                                      "focus:border-orange-500 focus:ring-orange-500"
                                    }`}
                                  />
                                  {addForm.formState.errors.schedule?.[index]
                                    ?.closeTime && (
                                    <p className="text-red-500 text-xs mt-1.5 font-medium">
                                      {
                                        addForm.formState.errors.schedule[index]
                                          ?.closeTime?.message
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2.5 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    {...addForm.register(
                                      `schedule.${index}.isClosed`,
                                      {
                                        onChange: (e) =>
                                          handleIsClosedChange(
                                            index,
                                            e.target.checked
                                          ),
                                      }
                                    )}
                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer transition-colors"
                                  />
                                  <span
                                    className={
                                      isClosed
                                        ? "text-gray-500 dark:text-gray-400"
                                        : ""
                                    }
                                  >
                                    Closed
                                  </span>
                                </Label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {addForm.formState.errors.schedule && (
                      <p className="text-red-500 text-sm mt-2">
                        {addForm.formState.errors.schedule.message}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseAddModal}
                disabled={formLoading}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={addForm.handleSubmit(handleAddRestaurantSubmit)}
                disabled={formLoading || !addForm.formState.isValid}
                className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Add Restaurant
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingRestaurant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  Edit Restaurant
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4" />
                  <span className="truncate">
                    {editingRestaurant.vendorId
                      ? getVendorBusinessName(editingRestaurant.vendorId)
                      : "No vendor assigned"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors ml-3 flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Restaurant Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Category
                </label>
                <select
                  id="edit-category"
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow appearance-none"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-vendor"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-gray-400" />
                  Vendor
                </label>
                <select
                  id="edit-vendor"
                  value={editFormData.vendorId}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      vendorId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow appearance-none"
                  required
                >
                  <option value="">Select vendor</option>
                  {vendors.map((vendor: IVendorFetched) => (
                    <option key={vendor.$id} value={vendor.$id}>
                      {vendor.businessName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-rating"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  id="edit-rating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editFormData.rating}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      rating: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-deliveryTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Delivery Time
                </label>
                <input
                  type="text"
                  id="edit-deliveryTime"
                  value={editFormData.deliveryTime}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      deliveryTime: e.target.value,
                    })
                  }
                  placeholder="e.g., 25-35 min"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  required
                />
              </div>

              {/* Addresses Section in Edit */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Addresses
                </label>
                {["Main Branch", "Branch 1", "Branch 2"].map((label, index) => (
                  <div key={index}>
                    <label
                      htmlFor={`edit-addresses-${index}`}
                      className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block"
                    >
                      {label} {index === 0 && "(Required)"}
                    </label>
                    <input
                      type="text"
                      id={`edit-addresses-${index}`}
                      value={editFormData.addresses[index] || ""}
                      onChange={(e) =>
                        handleAddressChange(index, e.target.value)
                      }
                      placeholder={`e.g., ${label} Address`}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                disabled={updating}
                className="px-4 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
              >
                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                {updating ? "Updating..." : "Update Restaurant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingRestaurant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Delete Restaurant
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      "{deletingRestaurant.name}"
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletingRestaurant(null);
                }}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}