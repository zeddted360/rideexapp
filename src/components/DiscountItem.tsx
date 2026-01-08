// components/DiscountItem.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import {
  Heart,
  Check,
  Loader2,
  Utensils,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { IDiscountFetched } from "../../types/types";
import { Button } from "./ui/button";
import { useRestaurantById } from "@/hooks/useRestaurant";
import { OutOfStockModal } from "./OutOfStockModal";

interface DiscountItemProps {
  discount: IDiscountFetched;
  index: number;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  handleApplyDeal: (discount: IDiscountFetched) => void;
}

export const DiscountItem: React.FC<DiscountItemProps> = ({
  discount,
  index,
  favorites,
  toggleFavorite,
  handleApplyDeal,
}) => {
  const { restaurant, loading, error } = useRestaurantById(
    discount.restaurantId || null
  );
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const isOutOfStock = !!discount.isPaused;

  const handleCardClick = () => {
    if (isOutOfStock) {
      setShowOutOfStockModal(true);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      setShowOutOfStockModal(true);
      return;
    }
    handleApplyDeal(discount);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex-shrink-0 w-80 sm:w-96 relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer ${
          isOutOfStock
            ? ""
            : "hover:shadow-xl hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20"
        }`}
        onClick={handleCardClick}
      >
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-70 z-20 flex items-center justify-center backdrop-blur-[2px] p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full shadow-2xl">
                  <AlertCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Out of Stock
              </h3>
              <p className="text-gray-300 text-sm max-w-xs mx-auto">
                {discount.title} is currently unavailable. We'll restock soon!
              </p>
            </div>
          </div>
        )}

        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {discount.image ? (
            <Image
              src={fileUrl(
                validateEnv().discountBucketId || validateEnv().popularBucketId,
                discount.image as string
              )}
              alt={discount.title}
              fill
              className={`object-cover transition-transform duration-300 ${
                isOutOfStock ? "brightness-75" : "group-hover:scale-105"
              }`}
              sizes="(max-width: 640px) 80vw, 384px"
              quality={85}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center text-4xl">
              💸
            </div>
          )}

          {/* Badges */}
          {!isOutOfStock && (
            <>
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {discount.discountType === "percentage"
                  ? `${discount.discountValue}%`
                  : `₦${discount.discountValue}`}
              </div>
              {discount.isActive && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Active
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(discount.$id);
                }}
                className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 transform hover:scale-110 z-10"
                aria-label={
                  favorites.has(discount.$id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Heart
                  className={`w-4 h-4 ${
                    favorites.has(discount.$id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600"
                  }`}
                />
              </button>
            </>
          )}
        </div>

        {/* Content Section */}
        <div
          className={`p-4 flex flex-col gap-4 ${
            isOutOfStock ? "opacity-50" : ""
          }`}
        >
          <div className="space-y-3">
            {/* Restaurant Name */}
            {discount.restaurantId && (
              <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300">
                <Utensils className="w-3 h-3" />
                {loading === "pending" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : error ? (
                  <span className="text-xs text-red-500">Error</span>
                ) : (
                  <span>{restaurant?.name || "Restaurant not found"}</span>
                )}
              </div>
            )}

            {/* Title */}
            <h3
              className={`text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1 ${
                isOutOfStock ? "text-gray-500 dark:text-gray-400" : ""
              }`}
            >
              {discount.title}
            </h3>

            {/* Description */}
            <p
              className={`text-gray-600 dark:text-gray-400 text-sm line-clamp-2 ${
                isOutOfStock ? "text-gray-400 dark:text-gray-500" : ""
              }`}
            >
              {discount.description}
            </p>

            {/* Other details (scope, validity, price, conditions) */}
            {/* ... (keep the rest of your content section as-is) */}
          </div>

          <Button
            onClick={handleApplyClick}
            disabled={isOutOfStock}
            className={`bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-semibold transition-all duration-200 transform active:scale-95 ${
              isOutOfStock
                ? "bg-gray-400 text-gray-600 cursor-not-allowed hover:scale-100"
                : "hover:from-orange-600 hover:to-red-600 hover:scale-105 hover:shadow-lg"
            }`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isOutOfStock ? "Unavailable" : "Apply Deal"}
          </Button>
        </div>
      </motion.div>

      {showOutOfStockModal && (
        <OutOfStockModal
          itemName={discount.title}
          onClose={() => setShowOutOfStockModal(false)}
        />
      )}
    </>
  );
};
