"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have shadcn/ui Skeleton component

interface PopularItemSkeletonProps {
  count?: number;
}

const PopularItemSkeleton: React.FC<PopularItemSkeletonProps> = ({
  count = 4, // Default to a reasonable number for popular items list
}) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="group flex bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full h-[160px] sm:h-[200px] border border-gray-200 dark:border-gray-700"
        >
          {/* Image skeleton on the left */}
          <div className="relative w-1/3 h-full overflow-hidden flex-shrink-0">
            <Skeleton className="absolute inset-0 w-full h-full" />
            {/* Heart button skeleton */}
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
            {/* Rating badge skeleton */}
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
              <Skeleton className="w-12 h-5 rounded-full" />
            </div>
          </div>

          {/* Content skeleton on the right */}
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
            <div className="space-y-1 sm:space-y-2">
              <Skeleton className="h-5 w-3/4" /> {/* Name */}
              <Skeleton className="h-3.5 w-1/2" /> {/* Restaurant */}
              <Skeleton className="h-3.5 w-full" /> {/* Description line 1 */}
              <Skeleton className="h-3.5 w-4/5" /> {/* Description line 2 */}
              <Skeleton className="h-3 w-20" /> {/* Category */}
            </div>
            <div className="flex items-center justify-between pt-1 sm:pt-2">
              <Skeleton className="h-5 w-12" /> {/* Price */}
              <Skeleton className="h-8 w-20 rounded-xl" /> {/* Add button */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopularItemSkeleton;
