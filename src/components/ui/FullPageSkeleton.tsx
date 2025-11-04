import React from "react";
import { Skeleton } from "./skeleton";
import RestaurantCardSkeleton from "./restaurantCardSkeleton";
import MenuItemCardSkeleton from "./MenuItemCardSkeleton";

const FullPageSkeleton: React.FC = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 bg-opacity-95">
    {/* Restaurant skeleton row */}
    <div className="flex gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
    {/* Menu item skeleton grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-5xl">
      {[...Array(4)].map((_, i) => (
        <MenuItemCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default FullPageSkeleton; 