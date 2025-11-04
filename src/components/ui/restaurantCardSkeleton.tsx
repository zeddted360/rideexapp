import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex-shrink-0 w-[200px] sm:w-auto animate-pulse">
      <Skeleton className="w-full h-36 rounded-t-xl bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
