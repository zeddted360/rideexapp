'use client';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

function SkeletonOfferCard({ viewMode }: { viewMode: 'list' | 'grid' }) {
  const isListView = viewMode === 'list';

  if (isListView) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-4 p-4 sm:p-6">
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/50">
      <Skeleton className="w-full h-44" />
      <div className="p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-1/3" />
          </div>
          <Skeleton className="h-10 w-1/2 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonOfferCard;