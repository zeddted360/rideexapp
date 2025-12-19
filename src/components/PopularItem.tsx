"use client";

import { Heart, ShoppingBag, ThumbsUp } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { IPopularItemFetched } from "../../types/types";
import { useShowCart } from "@/context/showCart";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { listAsyncPopularItems } from "@/state/popularSlice";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { getRestaurantNamesByIds } from "@/utils/restaurantUtils";
import PopularItemSkeleton from "./opularItemSkeleton";

interface IPopularItemProps {
  toggleFavorite: (id: string) => void;
  favorites: Set<string>;
}

const PopularItem = ({ toggleFavorite, favorites }: IPopularItemProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { popularItems, loading, error } = useSelector(
    (state: RootState) => state.popularItem
  );

  const [restaurantNames, setRestaurantNames] = useState<Map<string, string>>(
    new Map()
  );
  
  const { setIsOpen, setItem } = useShowCart();
  const { user } = useAuth();
  const router = useRouter();

  // Fetch popular items on mount
  useEffect(() => {
    if (loading === "idle") {
      dispatch(listAsyncPopularItems())
        .unwrap()
        .catch((err) => {
          console.error(
            `Failed to fetch popular items: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        });
    }
  }, [dispatch, loading]);

  // Fetch restaurant names when popular items change
  useEffect(() => {
    if (popularItems.length > 0) {
      const restaurantIds = [
        ...new Set(popularItems.map((item) => item.restaurantId)),
      ];
      getRestaurantNamesByIds(restaurantIds)
        .then((names) => {
          setRestaurantNames(names);
        })
        .catch((error) => {
          console.warn("Failed to fetch restaurant names:", error);
        });
    }
  }, [popularItems]);

  // Filter approved items
  const approvedItems = popularItems.filter((item) => item.isApproved === true);

  // Shuffle items randomly on every page load
  const shuffledItems = useMemo(() => {
    const shuffled = [...approvedItems];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [approvedItems]); // Re-shuffle only when approved items change

  // Loading state
  if (loading === "pending") {
    return (
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Most Popular Items
            </h2>
          </div>
          <PopularItemSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Most Popular Items
            </h2>
          </div>

          {shuffledItems.length > 0 ? (
            <div className="space-y-6">
              {shuffledItems.map((item: IPopularItemFetched) => {
                // Calculate percentage: (rating / 5) * 100
                const ratingPercentage = ((item.rating || 0) / 5) * 100;

                return (
                  <div
                    key={item.$id}
                    className="group flex bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full h-[160px] sm:h-[200px] border border-gray-200 dark:border-gray-700"
                  >
                    {/* Image on the left */}
                    <div className="relative w-1/3 h-full overflow-hidden flex-shrink-0">
                      <Image
                        src={fileUrl(validateEnv().popularBucketId, item.image)}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="250px"
                        quality={90}
                        priority
                      />
                      <button
                        onClick={() => toggleFavorite(item.$id)}
                        className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-1 sm:p-1.5 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200 z-10"
                      >
                        <Heart
                          className={`w-3 sm:w-4 h-3 sm:h-4 ${
                            favorites.has(item.$id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        />
                      </button>
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <ThumbsUp className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current" />
                          <span>{Math.round(ratingPercentage)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Content on the right */}
                    <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                      <div className="space-y-1 sm:space-y-2">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide mb-1 line-clamp-1">
                          {restaurantNames.get(item.restaurantId) ||
                            `Restaurant ${item.restaurantId.slice(-4)}`}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {item.category}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                          ₦{item.price}
                        </span>
                        <Button
                          onClick={() => {
                            if (user) {
                              setItem({
                                userId: user?.userId as string,
                                itemId: item.$id,
                                name: item.name,
                                image: item.image,
                                price: item.price,
                                restaurantId: item.restaurantId,
                                quantity: 1,
                                category: item.category,
                                source: "popular",
                                description: item.description,
                                extras: item.extras,
                              });
                              setIsOpen(true);
                            } else {
                              router.push("/login");
                            }
                          }}
                          aria-label={`Add ${item.name} to cart`}
                          className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 min-w-[100px] sm:min-w-[120px]"
                        >
                          <ShoppingBag className="w-3 sm:w-4 h-3 sm:h-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No approved popular items available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PopularItem;
