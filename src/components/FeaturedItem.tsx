"use client";

import { ThumbsUp, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { IFeaturedItemFetched } from "../../types/types";
import { useShowCart } from "@/context/showCart";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { getRestaurantNamesByIds } from "@/utils/restaurantUtils";
import { listAsyncFeaturedItems } from "@/state/featuredSlice";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import FeaturedItemSkeleton from "./FeaturedItemSkeleton";

interface IFeaturedItemProps {
  toggleFavorite: (id: string) => void;
  favorites: Set<string>;
}

const FeaturedItem = ({ toggleFavorite, favorites }: IFeaturedItemProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [restaurantNames, setRestaurantNames] = useState<Map<string, string>>(
    new Map()
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const itemsPerPage = 8;
  const dispatch = useDispatch<AppDispatch>();
  const { featuredItems, loading, error } = useSelector(
    (state: RootState) => state.featuredItem
  );
  const { setIsOpen, setItem, item } = useShowCart();
  const router = useRouter();
  const { user } = useAuth();

  // Fetch featured items on mount
  useEffect(() => {
    if (loading === "idle" || isInitialLoading) {
      dispatch(listAsyncFeaturedItems())
        .unwrap()
        .catch((err) => {
          console.error(
            `Failed to fetch featured items: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        })
        .finally(() => setIsInitialLoading(false));
    }
  }, [dispatch, loading, isInitialLoading]);

  // Fetch restaurant names when featured items change
  useEffect(() => {
    if (featuredItems.length > 0) {
      const restaurantIds = [
        ...new Set(featuredItems.map((item) => item.restaurantId)),
      ];
      getRestaurantNamesByIds(restaurantIds)
        .then((names) => {
          setRestaurantNames(names);
        })
        .catch((error) => {
          console.warn("Failed to fetch restaurant names:", error);
        });
    }
  }, [featuredItems]);

  // Filter approved items
  const approvedItems = featuredItems.filter(
    (item) => item.isApproved === true
  );

  // Shuffle items randomly on every load (using useMemo for efficiency)
  const shuffledItems = useMemo(() => {
    const shuffled = [...approvedItems];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [approvedItems]); // Re-shuffle only when approvedItems change

  // Pagination on shuffled items
  const startIndex = currentPage * itemsPerPage;
  const displayedItems = shuffledItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Navigation handlers
  const handleNext = () => {
    if (startIndex + itemsPerPage < shuffledItems.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Show skeleton during initial load or pending state
  if (isInitialLoading || loading === "pending") {
    return (
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Featured Items
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              Discover our most popular dishes
            </p>
          </div>
          <div className="relative">
            <FeaturedItemSkeleton count={8} />
          </div>
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
              Featured Items
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              Discover our most popular dishes
            </p>
          </div>

          {/* Navigation Buttons and Grid Container */}
          <div className="relative">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-md transition-colors duration-200 z-10 ${
                currentPage === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white dark:hover:bg-gray-700"
              }`}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={startIndex + itemsPerPage >= shuffledItems.length}
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-md transition-colors duration-200 z-10 ${
                startIndex + itemsPerPage >= shuffledItems.length
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white dark:hover:bg-gray-700"
              }`}
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayedItems.length > 0
                ? displayedItems
                    .slice(0, 6)
                    .map((item: IFeaturedItemFetched) => {
                      // Calculate percentage: (rating / 5) * 100
                      const ratingPercentage = ((item.rating || 0) / 5) * 100;
                      return (
                        <div
                          key={item.$id}
                          className="group bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="relative">
                            <div className="w-full h-28 sm:h-32 overflow-hidden">
                              <Image
                                src={fileUrl(
                                  validateEnv().featuredBucketId,
                                  item.image
                                )}
                                alt={item.name}
                                width={200}
                                height={150}
                                className="object-cover w-full h-full"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                              />
                            </div>
                            {/* Rating as percentage with thumb icon */}
                            <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                              <div className="flex items-center gap-0.5">
                                <ThumbsUp className="w-2.5 h-2.5 fill-current" />
                                {Math.round(ratingPercentage)}%
                              </div>
                            </div>
                          </div>

                          <div className="p-2 sm:p-3">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide mb-1 line-clamp-1">
                              {restaurantNames.get(item.restaurantId) ||
                                `Restaurant ${item.restaurantId.slice(-4)}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400">
                                ₦{item.price}
                              </span>
                              <button
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
                                      source: "featured",
                                      description: item.description,
                                    });
                                    setIsOpen(true);
                                  } else {
                                    router.push("/login");
                                  }
                                }}
                                aria-label={`Add ${item.name} to cart`}
                                className="flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold text-xs hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
                              >
                                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                                <span className="hidden sm:inline">
                                  Add to Cart
                                </span>
                                <span className="sm:hidden">Add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturedItem;
