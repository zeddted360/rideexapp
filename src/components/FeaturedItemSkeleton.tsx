"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have shadcn/ui Skeleton component

interface FeaturedItemSkeletonProps {
  count?: number;
}

const FeaturedItemSkeleton: React.FC<FeaturedItemSkeletonProps> = ({
  count = 8, // Default to itemsPerPage
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="group bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="relative">
            <div className="w-full h-28 sm:h-32 overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
            {/* Rating skeleton */}
            <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
              <Skeleton className="w-8 h-4" />
            </div>
          </div>

          <div className="p-2 sm:p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" /> {/* Name */}
            <Skeleton className="h-3 w-1/2" /> {/* Restaurant */}
            <Skeleton className="h-3 w-full" /> {/* Description line 1 */}
            <Skeleton className="h-3 w-4/5" /> {/* Description line 2 */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-10" /> {/* Price */}
              <Skeleton className="h-6 w-16 rounded-full" />{" "}
              {/* Add to Cart button */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedItemSkeleton;
