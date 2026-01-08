"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ThumbsUp, AlertCircle } from "lucide-react";
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
import { OutOfStockModal } from "@/components/OutOfStockModal";
import PopularItemSkeleton from "./opularItemSkeleton";

interface IPopularItemProps {
  toggleFavorite: (id: string) => void;
  favorites: Set<string>;
}

const PopularItem = ({ toggleFavorite, favorites }: IPopularItemProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    popularItems,
    loading: loadingState,
    error,
  } = useSelector((state: RootState) => state.popularItem);
  const loading = loadingState as "idle" | "pending" | "succeeded" | "failed";

  const [restaurantNames, setRestaurantNames] = useState<Map<string, string>>(
    new Map()
  );
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState("");

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
  }, [approvedItems]);

  const handleAddToCart = (item: IPopularItemFetched) => {
    if (item.isPaused) {
      setSelectedItemName(item.name);
      setShowOutOfStockModal(true);
      return;
    }

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
  };

  const handleItemClick = (item: IPopularItemFetched) => {
    if (item.isPaused) {
      setSelectedItemName(item.name);
      setShowOutOfStockModal(true);
    }
  };

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
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Most Popular Items
          </h2>
        </div>

        {shuffledItems.length > 0 ? (
          <div className="space-y-5">
            {shuffledItems.map((item: IPopularItemFetched) => {
              const ratingPercentage = ((item.rating || 0) / 5) * 100;
              const isOutOfStock = !!item.isPaused;

              return (
                <motion.div
                  key={item.$id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`group relative flex bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer ${
                    isOutOfStock ? "cursor-default" : ""
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Out of Stock Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-70 z-10 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="text-center px-6">
                        <div className="mb-4">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full shadow-xl">
                            <AlertCircle className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          Out of Stock
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {item.name} is currently unavailable.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Image on the left */}
                  <div className="relative w-1/3 sm:w-1/4 lg:w-1/5 h-44 sm:h-52 overflow-hidden flex-shrink-0">
                    <Image
                      src={fileUrl(validateEnv().popularBucketId, item.image)}
                      alt={item.name}
                      fill
                      className={`object-cover transition-transform duration-500 ${
                        isOutOfStock ? "brightness-75" : "group-hover:scale-105"
                      }`}
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      quality={85}
                    />
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.$id);
                      }}
                      className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200 z-20"
                    >
                      <Heart
                        className={`w-5 h-5 transition-all duration-300 ${
                          favorites.has(item.$id)
                            ? "fill-red-500 text-red-500 scale-110"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      />
                    </button>
                    {/* Rating Badge */}
                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-md z-20">
                      <ThumbsUp className="w-4 h-4 fill-current text-orange-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.round(ratingPercentage)}%
                      </span>
                    </div>
                  </div>

                  {/* Content on the right */}
                  <div
                    className={`flex-1 p-4 flex flex-col justify-between ${
                      isOutOfStock ? "opacity-50" : ""
                    }`}
                  >
                    <div className="space-y-2">
                      <h3
                        className={`font-bold text-lg line-clamp-1 ${
                          isOutOfStock
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {restaurantNames.get(item.restaurantId) ||
                          `Restaurant ${item.restaurantId.slice(-4)}`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {item.category}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span
                        className={`text-xl font-bold ${
                          isOutOfStock
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        ₦{item.price}
                      </span>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        disabled={isOutOfStock}
                        className={`flex items-center px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg ${
                          isOutOfStock
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                        }`}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {isOutOfStock ? "Unavailable" : "Add"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            No approved popular items available at the moment.
          </div>
        )}
      </div>

      {/* Out of Stock Modal */}
      {showOutOfStockModal && (
        <OutOfStockModal
          itemName={selectedItemName}
          onClose={() => setShowOutOfStockModal(false)}
        />
      )}
    </section>
  );
};

export default PopularItem;
