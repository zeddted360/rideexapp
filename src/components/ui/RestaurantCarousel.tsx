import React, { useState } from "react";
import Image from "next/image";
import { Star, Timer, TimerOff } from "lucide-react";
import { IRestaurantFetched } from "../../../types/types";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { Skeleton } from "./skeleton";
import { isOpen } from "@/utils/isOpen";

interface RestaurantCarouselProps {
  restaurants: IRestaurantFetched[];
  loading: string;
  error?: string;
  onSelectRestaurant: (restaurant: IRestaurantFetched) => void;
}

const RestaurantCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex-shrink-0 w-[140px] h-[180px] animate-pulse">
    <Skeleton className="w-full h-24 rounded-t-xl" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-10" />
    </div>
  </div>
);

const RestaurantCarousel: React.FC<RestaurantCarouselProps> = ({ restaurants, loading, error, onSelectRestaurant }) => {
  const [search, setSearch] = useState("");
  const filtered = restaurants.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).filter(r => r.isPaused !== true);

 
  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search restaurants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      {/* Error State */}
      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}
      {/* Loading Skeleton */}
      {loading === "pending" ? (
        <div className="flex overflow-x-auto space-x-4 pb-2">
          {[...Array(4)].map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div>
          {/* Mobile: Horizontal Scroll */}
          <div className="flex lg:hidden overflow-x-auto space-x-4 pb-2 scrollbar-hide">
            {filtered.length === 0 ? (
              <div className="text-gray-500 text-center w-full">No restaurants found</div>
            ) : (
              filtered.map(r => (
                <div
                  key={r.$id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex-shrink-0 w-[140px] h-[200px] cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => onSelectRestaurant(r)}
                >
                  <div className="relative w-full h-24">
                    <Image
                      src={fileUrl(validateEnv().restaurantBucketId, r.logo as string)}
                      alt={r.name}
                      fill
                      className="object-cover w-full h-full"
                      sizes="140px"
                      quality={100}
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-sm truncate">{r.name}</div>
                    <div className="text-xs text-gray-500 truncate">{r.category}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                      <Star className="w-3 h-3 fill-current" />
                      {r.rating}
                    </div>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {isOpen(r) ? (
                        <>
                          <span className="text-green-600 font-medium">Open</span>
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
              ))
            )}
          </div>
          {/* Desktop: Grid */}
          <div className="hidden lg:grid grid-cols-4 gap-6">
            {filtered.length === 0 ? (
              <div className="text-gray-500 text-center col-span-4">No restaurants found</div>
            ) : (
              filtered.map(r => (
                <div
                  key={r.$id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => onSelectRestaurant(r)}
                >
                  <div className="relative w-full h-32">
                    <Image
                      src={fileUrl(validateEnv().restaurantBucketId, r.logo as string)}
                      alt={r.name}
                      fill
                      className="object-cover w-full h-full"
                      sizes="(min-width: 1024px) 220px, 100vw"
                      quality={100}
                    />
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-base truncate">{r.name}</div>
                    <div className="text-xs text-gray-500 truncate">{r.category}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 text-xs text-orange-500">
                        <Star className="w-3 h-3 fill-current" />
                        {r.rating}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        {isOpen(r) ? (
                          <>
                            <Timer className="w-3 h-3 text-green-600" />
                            <span className="text-green-600 font-medium">Opened</span>
                          </>
                        ) : (
                          <>
                            <TimerOff className="w-3 h-3 text-red-600" />
                            <span className="text-red-600 font-medium">Closed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantCarousel;