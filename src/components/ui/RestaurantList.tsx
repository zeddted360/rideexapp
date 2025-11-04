"use client";
import { listAsyncRestaurants } from "@/state/restaurantSlice";
import { AppDispatch, RootState } from "@/state/store";
import { Utensils, Grid, List, Leaf, Drumstick } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MenuItemCardSkeleton from "./MenuItemCardSkeleton";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { listAsyncMenusItem } from "@/state/menuSlice";
import RestaurantCarousel from "./RestaurantCarousel";
import { IRestaurantFetched } from "@/../types/types";
import MenuItemCard from "./MenuItemCard";
import StickyCartBar from "./StickyCartBar";
import FullPageSkeleton from "./FullPageSkeleton";

const RestaurantList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { error, loading, restaurants } = useSelector(
    (state: RootState) => state.restaurant
  );
  const {
    menuItems,
    loading: menuLoading,
    error: menuError,
  } = useSelector((state: RootState) => state.menuItem);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<IRestaurantFetched | null>(null);
  const [selectedType, setSelectedType] = useState<"all" | "veg" | "non-veg">(
    "all"
  );
  const [localMenuLoading, setLocalMenuLoading] = useState(false);

  useEffect(() => {
    if (loading === "idle") {
      dispatch(listAsyncRestaurants());
    }
    if (menuLoading === "idle") {
      dispatch(listAsyncMenusItem());
    }
    // Auto-select the first restaurant when loaded
    if (
      loading === "succeeded" &&
      restaurants.length > 0 &&
      !selectedRestaurant
    ) {
      setSelectedRestaurant(restaurants[0]);
    }
  }, [dispatch, loading, menuLoading, restaurants, selectedRestaurant]);

  // Trigger local loading when restaurant or type changes
  useEffect(() => {
    if (selectedRestaurant || selectedType !== "all") {
      setLocalMenuLoading(true);
      const timeout = setTimeout(() => setLocalMenuLoading(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [selectedRestaurant, selectedType]);

  // Scroll functions for restaurant cards
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  // Loading state
  if (loading === "pending" && menuLoading === "pending") {
    return <FullPageSkeleton />;
  }

  // Error state
  if (loading === "failed" && error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // No restaurants state
  if (loading === "succeeded" && restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Utensils className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              No Restaurants
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No restaurants available at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state with restaurants
  if (loading === "succeeded" && restaurants.length > 0) {
    // Filter menu items by approval status, selected restaurant, and type
    const approvedMenuItems = menuItems.filter(
      (item) => item.isApproved === true
    );
    const filteredMenuItems = selectedRestaurant
      ? approvedMenuItems.filter(
          (item) =>
            item.restaurantId === selectedRestaurant.$id &&
            (selectedType === "all" ? true : item.category === selectedType)
        )
      : approvedMenuItems;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RestaurantCarousel
            restaurants={restaurants}
            loading={loading}
            error={error || undefined}
            onSelectRestaurant={setSelectedRestaurant}
          />
          {/* Veg/Non-Veg Tabs and Grid/List Toggle - Side by side */}
          <div className="flex items-center justify-between gap-4 mb-6 overflow-x-auto flex-nowrap">
            {/* Veg/Non-Veg Tabs - Horizontal scroll on mobile if needed */}
            <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
              <button
                className={`px-3 py-2 rounded-full font-semibold text-sm md:text-base transition-colors duration-200 whitespace-nowrap ${
                  selectedType === "all"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setSelectedType("all")}
              >
                All
              </button>
              <button
                className={`px-3 py-2 rounded-full font-semibold flex items-center gap-1 transition-colors duration-200 text-sm md:text-base whitespace-nowrap ${
                  selectedType === "veg"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setSelectedType("veg")}
              >
                <Leaf className="w-3 h-3 md:w-4 md:h-4" /> Vegetarian
              </button>
              <button
                className={`px-3 py-2 rounded-full font-semibold flex items-center gap-1 transition-colors duration-200 text-sm md:text-base whitespace-nowrap ${
                  selectedType === "non-veg"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setSelectedType("non-veg")}
              >
                <Drumstick className="w-3 h-3 md:w-4 md:h-4" /> Non-Vegetarian
              </button>
            </div>
            {/* Grid/List Toggle - Always visible and clickable */}
            <div className="flex gap-1 md:gap-2 flex-nowrap">
              <button
                className={`p-1.5 md:p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  viewMode === "grid"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                className={`p-1.5 md:p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  viewMode === "list"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
          {/* Menu Items Section */}
          <div className="mb-24">
            {menuLoading === "pending" || localMenuLoading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "flex flex-col gap-4"
                }
              >
                {[...Array(4)].map((_, index) => (
                  <MenuItemCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                No approved menu items available.
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMenuItems.map((item) => (
                  <MenuItemCard key={item.$id} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredMenuItems.map((item) => (
                  <MenuItemCard key={item.$id} item={item} />
                ))}
              </div>
            )}
          </div>
          {/* Sticky Cart Bar for Mobile */}
          <StickyCartBar />
        </div>
      </div>
    );
  }

  return null;
};

export default RestaurantList;
