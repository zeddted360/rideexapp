"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton"; 

interface PromotionalImageSkeletonProps {
  count?: number;
}

const PromotionalImageSkeleton: React.FC<PromotionalImageSkeletonProps> = ({
  count = 2,
}) => {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="w-full group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
        >
          {/* Image Container Skeleton */}
          <div className="relative w-full aspect-[21/9] bg-gray-100 dark:bg-gray-800">
            <Skeleton className="absolute inset-0 h-full w-full" />
          </div>

          {/* Optional: Skeleton for admin controls if needed, but keep minimal for loading */}
        </div>
      ))}
    </div>
  );
};

export default PromotionalImageSkeleton;
