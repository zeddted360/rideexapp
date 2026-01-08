import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, Plus, Clock, Heart, AlertCircle, Flame } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { IMenuItemFetched } from "../../../../types/types";
import { useShowCart } from "@/context/showCart";

interface MenuItemCardProps {
  item: IMenuItemFetched;
  restaurantId: string;
}

export const RestaurantMenuItem: React.FC<MenuItemCardProps> = ({
  item,
  restaurantId,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const { setIsOpen, setItem } = useShowCart();

  const isOutOfStock = !!item.isPaused;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      setShowOutOfStockModal(true);
      return;
    }

    if (user) {
      setItem({
        userId: user.userId,
        itemId: item.$id,
        name: item.name,
        image: item.image,
        price: item.price,
        restaurantId,
        quantity: 1,
        category: item.category,
        source: "menu" as const,
        extras: item.extras,
      });
      setIsOpen(true);
    } else {
      router.push("/login");
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    toast.success(
      isFavorited ? "Removed from favorites" : "Added to favorites",
      {
        duration: 2000,
        position: "top-right",
      }
    );
  };

  const handleCardClick = () => {
    if (isOutOfStock) {
      setShowOutOfStockModal(true);
    }
  };

  const getImageUrl = (imageId: string) => {
    try {
      return fileUrl(validateEnv().menuBucketId, imageId);
    } catch (error) {
      console.error("Error generating image URL:", error);
      return "/fallback-food.webp";
    }
  };

  const price = parseFloat(item.price);
  const originalPrice = item.originalPrice
    ? parseFloat(item.originalPrice)
    : null;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <>
      {/* Main Card */}
      <div
        className={`group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-300 ${
          isOutOfStock
            ? "opacity-75"
            : "hover:shadow-xl hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20 hover:border-orange-200 dark:hover:border-orange-800"
        } cursor-pointer`}
        onClick={handleCardClick}
      >
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 z-20 flex items-center justify-center backdrop-blur-[2px]">
            <div className="text-center px-6">
              <div className="mb-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/90 rounded-2xl shadow-xl">
                  <AlertCircle className="w-9 h-9 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1.5">
                Out of Stock
              </h3>
            </div>
          </div>
        )}

        {/* Image Container with modern aspect ratio */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          {!imageError ? (
            <Image
              src={getImageUrl(item.image)}
              alt={item.name}
              fill
              className={`object-cover transition-all duration-500 ${
                isOutOfStock
                  ? "brightness-75 grayscale"
                  : "group-hover:scale-105"
              }`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 flex items-center justify-center">
              <div className="text-orange-400 text-center">
                <div className="w-14 h-14 mx-auto mb-2 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">🍽️</span>
                </div>
                <p className="text-xs font-medium">No image</p>
              </div>
            </div>
          )}

          {/* Top badges and actions */}
          {!isOutOfStock && (
            <>
              {/* Favorite Button - Always visible on mobile, hover on desktop */}
              <button
                onClick={handleFavoriteToggle}
                className="absolute top-3 right-3 w-9 h-9 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
              >
                <Heart
                  className={`w-4.5 h-4.5 transition-all duration-300 ${
                    isFavorited
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                />
              </button>

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm z-10">
                  {discountPercentage}% OFF
                </div>
              )}

              {/* Rating Badge - Bottom left */}
              {item.rating && (
                <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 shadow-md z-10">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {item.rating}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title and Category */}
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className={`font-bold text-base leading-snug line-clamp-1 flex-1 ${
                  isOutOfStock
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {item.name}
              </h3>
              {!isOutOfStock && item.isPopular && (
                <div className="flex-shrink-0">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
              )}
            </div>

            <p
              className={`text-xs leading-relaxed line-clamp-2 mb-2.5 ${
                isOutOfStock
                  ? "text-gray-400 dark:text-gray-600"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {item.description}
            </p>

            {/* Category and Cook Time */}
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-lg font-medium ${
                  isOutOfStock
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    : "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400"
                }`}
              >
                {item.category}
              </span>
              <div
                className={`flex items-center gap-1 ${
                  isOutOfStock
                    ? "text-gray-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Clock className="w-3 h-3" />
                <span className="font-medium">{item.cookTime}</span>
              </div>
            </div>
          </div>

          {/* Price and Add Button */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl font-bold ${
                    isOutOfStock
                      ? "text-gray-400 dark:text-gray-600"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  ₦{price.toLocaleString()}
                </span>
                {hasDiscount && !isOutOfStock && (
                  <span className="text-xs text-gray-400 line-through">
                    ₦{originalPrice!.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button - Compact circle */}
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-shrink-0 w-10 h-10 rounded-full p-0 flex items-center justify-center transition-all duration-300 shadow-md ${
                isOutOfStock
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-lg hover:scale-110 active:scale-95"
              }`}
            >
              <Plus
                className={`w-5 h-5 transition-transform duration-300 ${
                  isOutOfStock ? "" : "group-hover:rotate-90"
                }`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Out of Stock Modal */}
      {showOutOfStockModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowOutOfStockModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
              <AlertCircle className="w-11 h-11 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oops!
            </h2>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {item.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              This item is currently out of stock. Please check back later or
              try something else from our menu!
            </p>
            <Button
              onClick={() => setShowOutOfStockModal(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              Got it, thanks!
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
