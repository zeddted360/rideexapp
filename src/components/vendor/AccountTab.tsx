"use client";

import React, {
  Dispatch,
  FC,
  SetStateAction,
  useState,
  useCallback,
} from "react";
import { Input } from "../ui/input";
import {
  IRestaurantFetched,
  IScheduleDay,
  IRestaurant,
} from "../../../types/types";
import { Edit, Search, Clock, MapPin, Star, Pause } from "lucide-react";
import EditRestaurantModal from "./EditRestaurantModal";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { isOpen } from "@/utils/isOpen";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import {
  updateAsyncRestaurant,
  getAsyncRestaurantById,
} from "@/state/restaurantSlice";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { RestaurantFormData } from "@/utils/schema";
import toast from "react-hot-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

interface IAccountTabProps {
  searchCategory: string;
  setSearchCategory: Dispatch<SetStateAction<string>>;
  filteredRestaurants: IRestaurantFetched[];
  setFilteredRestaurants: Dispatch<SetStateAction<IRestaurantFetched[]>>;
}

const AccountTab: FC<IAccountTabProps> = ({
  filteredRestaurants,
  setFilteredRestaurants,
  searchCategory,
  setSearchCategory,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [restaurant, setRestaurant] = useState<IRestaurantFetched | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPausedAlertOpen, setIsPausedAlertOpen] = useState<
    Map<string, boolean>
  >(new Map());
  const dispatch = useDispatch<AppDispatch>();

  const handleEditRestaurant = (id: string) => {
    const res = filteredRestaurants.find((restaurant) => restaurant.$id === id);
    if (!res || res.isPaused) {
      toast.error("Resume your restaurant on the admin dashboard to edit.");
      return;
    }
    setRestaurant(res);
    setShowEditModal(true);
  };

  const onSubmit = useCallback(
    async (
      data: RestaurantFormData,
      form: UseFormReturn<RestaurantFormData>
    ) => {
      if (!restaurant || restaurant.isPaused) {
        toast.error(
          "Your restaurant is currently paused and cannot be edited. Please contact support to resume operations and get back online"
        );
        return;
      }

      let hasChanges =
        data.logo instanceof FileList ||
        data.name !== restaurant.name ||
        data.category !== restaurant.category ||
        data.deliveryTime !== restaurant.deliveryTime ||
        data.rating !== (restaurant.rating || 0) ||
        JSON.stringify(data.schedule) !== JSON.stringify(restaurant.schedule) ||
        JSON.stringify(data.addresses) !== JSON.stringify(restaurant.addresses);

      if (!hasChanges) {
        toast.error("No changes were made to the restaurant information.");
        return;
      }

      setIsUpdating(true);
      try {
        const normalizedSchedule = data.schedule.map((d) => ({
          day: d.day,
          isClosed: d.isClosed,
          openTime: d.openTime ?? null,
          closeTime: d.closeTime ?? null,
        })) as IScheduleDay[];

        const processedAddresses = data.addresses.filter(
          (addr) => addr.trim() !== ""
        );

        let updateData: IRestaurant = {
          name: data.name,
          category: data.category,
          deliveryTime: data.deliveryTime,
          rating: data.rating,
          vendorId: data.vendorId || restaurant.vendorId,
          logo: data.logo as string | FileList,
          schedule: normalizedSchedule,
          addresses: processedAddresses,
        };

        await dispatch(
          updateAsyncRestaurant({
            id: restaurant.$id,
            data: updateData,
          })
        ).unwrap();

        const updatedRestaurant = await dispatch(
          getAsyncRestaurantById(restaurant.$id)
        ).unwrap();

        setFilteredRestaurants((prev) =>
          prev.map((r) => (r.$id === restaurant.$id ? updatedRestaurant : r))
        );

        setRestaurant(updatedRestaurant);
        setShowEditModal(false);
        toast.success("Restaurant updated successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to update restaurant");
      } finally {
        setIsUpdating(false);
        form.reset();
      }
    },
    [
      dispatch,
      restaurant,
      setFilteredRestaurants,
      setShowEditModal,
      setRestaurant,
    ]
  );

  const getTodaySchedule = (schedule: IScheduleDay[] | undefined) => {
    if (!schedule) return null;
    const now = new Date();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDay = daysOfWeek[now.getDay()];
    return schedule.find((s) => s.day === currentDay);
  };

  const togglePausedAlert = (id: string) => {
    setIsPausedAlertOpen((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, !newMap.get(id));
      return newMap;
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Search Section */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search restaurants by category..."
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
          />
        </div>

        {/* Results Section */}
        {filteredRestaurants.length > 0 ? (
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant: IRestaurantFetched) => {
              const todaySchedule = getTodaySchedule(restaurant.schedule);
              const isPaused = restaurant.isPaused || false;
              const alertId = restaurant.$id;
              const isAlertOpen = isPausedAlertOpen.get(alertId) || false;

              return (
                <motion.div
                  key={restaurant.$id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border ${
                    isPaused
                      ? "border-red-500 dark:border-red-800 shadow-red-200/50"
                      : "border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg"
                  } transition-all duration-300 hover:border-orange-200 dark:hover:border-orange-900`}
                  role={isPaused ? "alert" : "article"}
                  aria-label={
                    isPaused
                      ? `Paused restaurant: ${restaurant.name}`
                      : restaurant.name
                  }
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image Section */}
                    <div
                      className={`relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 bg-gradient-to-br ${
                        isPaused
                          ? "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20"
                          : "from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600"
                      }`}
                    >
                      <Image
                        src={fileUrl(
                          validateEnv().restaurantBucketId,
                          restaurant.logo as string
                        )}
                        alt={`${restaurant.name} logo`}
                        fill
                        className={`object-cover transition-opacity ${
                          isPaused ? "opacity-70" : ""
                        }`}
                      />
                      {!isPaused && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {restaurant.rating || 0}
                          </span>
                        </div>
                      )}
                      {isPaused && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-semibold text-sm shadow-lg">
                            <Pause className="w-4 h-4" />
                            Paused
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6 relative">
                      {/* Edit Button - ALWAYS VISIBLE */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleEditRestaurant(restaurant.$id)}
                            disabled={isPaused}
                            className={`absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 ${
                              isPaused
                                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50"
                                : "bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/50 text-orange-600 dark:text-orange-300"
                            }`}
                            aria-label={
                              isPaused
                                ? `Cannot edit ${restaurant.name} while paused`
                                : `Edit ${restaurant.name}`
                            }
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        {isPaused && (
                          <TooltipContent>
                            <p>Restaurant is paused – cannot edit</p>
                          </TooltipContent>
                        )}
                      </Tooltip>

                      {/* Restaurant Info */}
                      <div className="space-y-4 pr-16">
                        {" "}
                        {/* Added pr-16 to prevent overlap with button */}
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-1">
                            {restaurant.name}
                          </h3>
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                            <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                              {restaurant.category}
                            </span>
                          </div>
                        </div>
                        {isPaused && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                              height: isAlertOpen ? "auto" : 0,
                              opacity: isAlertOpen ? 1 : 0,
                            }}
                            className="overflow-hidden"
                          >
                            <Alert
                              className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 cursor-pointer"
                              onClick={() => togglePausedAlert(alertId)}
                              role="alert"
                            >
                              <Pause className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                  Your restaurant is paused
                                </div>
                                <p className="text-yellow-700 dark:text-yellow-300">
                                  Customers cannot view or order from{" "}
                                  {restaurant.name} right now. Contact admin to
                                  resume operations. Orders are held until then.
                                </p>
                              </AlertDescription>
                            </Alert>
                          </motion.div>
                        )}
                        <div
                          className={`flex flex-wrap gap-4 pt-2 ${
                            isPaused ? "opacity-70" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                              <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">
                              {restaurant.deliveryTime}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Status
                            </span>
                            <span
                              className={`text-sm font-semibold px-2.5 py-1 rounded-md ${
                                isPaused
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : isOpen(restaurant)
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {isPaused
                                ? "Paused"
                                : isOpen(restaurant)
                                ? "Open"
                                : "Closed"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Today's Hours
                            </span>
                            <span
                              className={`text-sm font-semibold text-gray-900 dark:text-gray-100 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 ${
                                isPaused ? "opacity-70" : ""
                              }`}
                            >
                              {isPaused
                                ? "Operations suspended"
                                : todaySchedule?.isClosed
                                ? "Closed"
                                : `${todaySchedule?.openTime || "N/A"} - ${
                                    todaySchedule?.closeTime || "N/A"
                                  }`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-5 shadow-inner">
              <Search className="w-12 h-12 text-orange-400 dark:text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {searchCategory.trim()
                ? "No restaurants found"
                : "No restaurants yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed">
              {searchCategory.trim()
                ? "Try adjusting your search category to find what you're looking for."
                : "Start adding restaurants to see them appear here."}
            </p>
          </div>
        )}

        {showEditModal && restaurant && !restaurant.isPaused && (
          <EditRestaurantModal
            restaurant={restaurant}
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            setRestaurant={setRestaurant}
            onSubmit={onSubmit}
            isUpdating={isUpdating}
            setIsUpdating={setIsUpdating}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default AccountTab;
