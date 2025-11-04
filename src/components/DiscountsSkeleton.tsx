"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have shadcn/ui Skeleton component

interface DiscountsSkeletonProps {
  count?: number;
}

const DiscountsSkeleton: React.FC<DiscountsSkeletonProps> = ({
  count = 3, // Default to a few cards for horizontal scroll
}) => {
  return (
    <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
        >
          {/* Image Section Skeleton */}
          <div className="relative">
            <div className="h-48 relative overflow-hidden">
              <Skeleton className="absolute inset-0 w-full h-full" />
              {/* Discount Badge Skeleton */}
              <div className="absolute top-3 left-3">
                <Skeleton className="w-10 h-5 rounded-full" />
              </div>
              {/* Active Badge Skeleton */}
              <div className="absolute top-3 right-3">
                <Skeleton className="w-12 h-5 rounded-full" />
              </div>
              {/* Favorite Button Skeleton */}
              <div className="absolute bottom-3 right-3">
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </div>
          </div>

          {/* Content Section Skeleton */}
          <div className="p-4 flex flex-col gap-4">
            <div className="space-y-3">
              {/* Restaurant Name Skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-3" />
                <Skeleton className="h-3 w-20" />
              </div>

              {/* Title & Info Button Skeleton */}
              <div className="flex items-start gap-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="w-6 h-6 rounded-full" />
              </div>

              {/* Scope & Validity Skeleton */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <div className="flex items-center gap-1">
                  <Skeleton className="w-3 h-3" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              {/* Description Skeleton */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Price & Conditions Skeleton */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            {/* Button Skeleton */}
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiscountsSkeleton;
