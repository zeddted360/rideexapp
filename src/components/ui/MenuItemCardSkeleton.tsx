import { Skeleton } from "@/components/ui/skeleton";

export default function MenuItemCardSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
      <div className="relative">
        <div className="w-full h-48 rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <Skeleton className="absolute top-3 left-3 h-6 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
      </div>

      <div className="mt-4 space-y-3">
        <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <Skeleton className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
          <Skeleton className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <Skeleton className="h-4 w-1/5 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <Skeleton className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>

        <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}

export function MenuItemListSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
      <div className="flex justify-center gap-2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
        <Skeleton className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
        <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
        <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <Skeleton className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <Skeleton className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <Skeleton className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
