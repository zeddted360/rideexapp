"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Heart,
  AlertCircle,
} from "lucide-react";
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
import { OutOfStockModal } from "@/components/OutOfStockModal"; // Import the reusable modal
import { Button } from "./ui/button";

interface IFeaturedItemProps {
  toggleFavorite: (id: string) => void;
  favorites: Set<string>;
}

const FeaturedItem: React.FC<IFeaturedItemProps> = ({
  toggleFavorite,
  favorites,
}) => {
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
  const { setIsOpen, setItem } = useShowCart();
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

  // Fetch restaurant names
  useEffect(() => {
    if (featuredItems.length > 0) {
      const restaurantIds = [
        ...new Set(featuredItems.map((item) => item.restaurantId)),
      ];
      getRestaurantNamesByIds(restaurantIds)
        .then((names) => setRestaurantNames(names))
        .catch((err) => console.warn("Failed to fetch restaurant names:", err));
    }
  }, [featuredItems]);

  // Filter approved items
  const approvedItems = featuredItems.filter(
    (item) => item.isApproved === true
  );

  // Shuffle items randomly
  const shuffledItems = useMemo(() => {
    const shuffled = [...approvedItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [approvedItems]);

  // Pagination
  const startIndex = currentPage * itemsPerPage;
  const displayedItems = shuffledItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

        {/* Navigation & Grid */}
        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg z-10 transition-all duration-300 ${
              currentPage === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-white dark:hover:bg-gray-700"
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={startIndex + itemsPerPage >= shuffledItems.length}
            className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg z-10 transition-all duration-300 ${
              startIndex + itemsPerPage >= shuffledItems.length
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-white dark:hover:bg-gray-700"
            }`}
          >
            <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedItems.length > 0 ? (
              displayedItems.map((item: IFeaturedItemFetched) => {
                const isOutOfStock = !!item.isPaused;
                const ratingPercentage = ((item.rating || 0) / 5) * 100;

                return (
                  <FeaturedItemCard
                    key={item.$id}
                    item={item}
                    restaurantName={
                      restaurantNames.get(item.restaurantId) ||
                      `Restaurant ${item.restaurantId.slice(-4)}`
                    }
                    toggleFavorite={toggleFavorite}
                    isFavorited={favorites.has(item.$id)}
                    isOutOfStock={isOutOfStock}
                    ratingPercentage={ratingPercentage}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                No featured items available at the moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Extracted Card Component for cleaner code & reusability
const FeaturedItemCard = ({
  item,
  restaurantName,
  toggleFavorite,
  isFavorited,
  isOutOfStock,
  ratingPercentage,
}: {
  item: IFeaturedItemFetched;
  restaurantName: string;
  toggleFavorite: (id: string) => void;
  isFavorited: boolean;
  isOutOfStock: boolean;
  ratingPercentage: number;
}) => {
  const { setIsOpen, setItem } = useShowCart();
  const router = useRouter();
  const { user } = useAuth();
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      setShowOutOfStockModal(true);
      return;
    }

    if (user) {
      setItem({
        userId: user.userId as string,
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
  };

  const handleCardClick = () => {
    if (isOutOfStock) {
      setShowOutOfStockModal(true);
    }
  };

  return (
    <>
      <div
        className={`group relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden transition-all duration-300 transform cursor-pointer ${
          isOutOfStock ? "" : "hover:shadow-lg hover:-translate-y-1"
        }`}
        onClick={handleCardClick}
      >
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-70 z-20 flex items-center justify-center backdrop-blur-[2px] p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full shadow-2xl">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Out of Stock
              </h3>
              <p className="text-gray-300 text-sm max-w-xs mx-auto">
                {item.name} is currently unavailable.
              </p>
            </div>
          </div>
        )}

        {/* Image */}
        <div className="relative h-32 sm:h-40 overflow-hidden">
          <Image
            src={fileUrl(validateEnv().featuredBucketId, item.image)}
            alt={item.name}
            fill
            className={`object-cover transition-all duration-500 ${
              isOutOfStock ? "brightness-75" : "group-hover:scale-105"
            }`}
          />
        </div>

        {/* Content */}
        <div className={`p-3 sm:p-4 ${isOutOfStock ? "opacity-50" : ""}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`font-bold text-base leading-tight line-clamp-1 flex-1 ${
                isOutOfStock
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {item.name}
            </h3>
            {!isOutOfStock && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.$id);
                }}
                className="flex-shrink-0"
              >
                <Heart
                  className={`w-5 h-5 transition-all duration-300 ${
                    isFavorited
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                />
              </button>
            )}
          </div>

          <p
            className={`text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1 ${
              isOutOfStock ? "text-gray-400 dark:text-gray-500" : ""
            }`}
          >
            {restaurantName}
          </p>

          <div className="flex items-center justify-between">
            <span
              className={`font-bold text-base ${
                isOutOfStock
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-orange-600 dark:text-orange-400"
              }`}
            >
              ₦{item.price}
            </span>

            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              size="sm"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-md hover:scale-105"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1" />
              {isOutOfStock ? "Unavailable" : "Add"}
            </Button>
          </div>
        </div>
      </div>

      {showOutOfStockModal && (
        <OutOfStockModal
          itemName={item.name}
          onClose={() => setShowOutOfStockModal(false)}
        />
      )}
    </>
  );
};

export default FeaturedItem;
