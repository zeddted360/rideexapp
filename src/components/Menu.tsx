"use client";
import { BikeIcon, Star, ChevronLeft, ChevronRight, Timer, TimerOff } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { listAsyncRestaurants } from "@/state/restaurantSlice";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IRestaurantFetched } from "../../types/types";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { isOpen } from "@/utils/isOpen";

// Skeleton component for loading state
const RestaurantCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-auto">
    <Skeleton className="w-full h-28 sm:h-32 md:h-36 rounded-t-xl" />
    <div className="p-3 sm:p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  </div>
);

// Restaurant card component
const RestaurantCard = React.memo(
  ({
    restaurant,
    router,
  }: {
    restaurant: IRestaurantFetched;
    router: AppRouterInstance;
  }) => {
    const handleClick = () => {
      router.push(`/restaurant/${restaurant.$id}`);
    };
    return (
      <div
        onClick={handleClick}
        className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-auto hover:scale-105 cursor-pointer snap-start"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={`View ${restaurant.name} menu`}
      >
        <div className="relative">
          <div className="w-full aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-200 dark:bg-gray-700">
            <Image
              src={fileUrl(validateEnv().restaurantBucketId, restaurant.logo as unknown as string)}
              alt={`${restaurant.name} logo`}
              width={200}
              height={150}
              quality={90}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 25vw"
              style={{ width: "100%", height: "100%" }}
              loading="lazy"
            />
          </div>
          {restaurant.rating && (
            <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
              <Star className="w-3 h-3 fill-current" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 line-clamp-1">
            {restaurant.name}
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 sm:space-y-2">
            <p className="line-clamp-1 font-medium">{restaurant.category}</p>
            <div className="flex items-center justify-between gap-1.5 text-gray-500 dark:text-gray-400 text-xs">
              <div className="flex items-center gap-1.5">
                <BikeIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{restaurant.deliveryTime}</span>
              </div>
              {/* closed or opened */}
              <div className="flex items-center justify-between gap-1 text-xs text-muted">
                {isOpen(restaurant) ? (
                  <>
                    <span className="text-green-600 font-medium">Opened</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-600 font-medium">Closed</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

RestaurantCard.displayName = "RestaurantCard";

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
  <div className="col-span-full text-center py-12 px-4">
    <div className="max-w-md mx-auto">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <BikeIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-lg">{message}</p>
    </div>
  </div>
);

// Error state component
const ErrorState = ({ error }: { error: string }) => (
  <div className="col-span-full text-center py-12 px-4">
    <div className="max-w-md mx-auto">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
        Oops! Something went wrong
      </p>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
    </div>
  </div>
);

const Menu = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading, restaurants } = useSelector(
    (state: RootState) => state.restaurant
  );
  const router = useRouter();

  // Sort restaurants by rating descending
  const sortedRestaurants = React.useMemo(() => {
    return [...restaurants].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [restaurants]);

  const displayRestaurants = sortedRestaurants.slice(0, 4);

  // Check scroll position for arrow visibility
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Fetch restaurants on mount
  useEffect(() => {
    if (loading === "idle") {
      dispatch(listAsyncRestaurants());
    }
  }, [dispatch, loading]);

  // Set up scroll listener
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      checkScrollPosition();
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
      
      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [sortedRestaurants]);

  const isLoading = loading === "idle" || loading === "pending";
  const hasFailed = loading === "failed";
  const hasRestaurants = sortedRestaurants.length > 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                Popular Restaurants
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                Discover amazing food near you
              </p>
            </div>
            <Button
              onClick={() => router.push("/menu")}
              variant="outline"
              className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800/30 hover:text-orange-700 dark:hover:text-orange-300 transition-colors duration-200 font-semibold"
            >
              View All
            </Button>
          </div>

          <div className="relative">
            {/* Navigation Arrows - Only visible on mobile */}
            {hasRestaurants && !isLoading && (
              <>
                {showLeftArrow && (
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors sm:hidden"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                )}
                {showRightArrow && (
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors sm:hidden"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                )}
              </>
            )}

            {/* Restaurant Cards Container */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible scrollbar-hide snap-x snap-mandatory"
            >
              {isLoading ? (
                [...Array(4)].map((_, index) => (
                  <RestaurantCardSkeleton key={`skeleton-${index}`} />
                ))
              ) : hasFailed ? (
                <ErrorState error={error || "Failed to load restaurants"} />
              ) : hasRestaurants ? (
                displayRestaurants.filter(r=>r.isPaused !== true).map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.$id}
                    restaurant={restaurant}
                    router={router}
                  />
                ))
              ) : (
                <EmptyState message="No restaurants available at the moment" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Scrollbar hiding styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Menu;