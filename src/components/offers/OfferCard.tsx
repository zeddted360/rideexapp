// components/offers/OfferCard.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Info,
  ShoppingBag,
  MoreVertical,
  Edit2,
  Trash2,
  Heart,
  Loader2,
  ShoppingBasket,
  AlertCircle,
  Pause,
  Play,
} from "lucide-react";
import { IFetchedExtras, IPromoOfferFetched } from "../../../types/types";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import {
  deleteAsyncPromoOfferItem,
  togglePausePromoOfferItem,
} from "@/state/offerSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/authContext";
import DeleteOfferModal from "./DeleteOfferModal";
import { useShowCart } from "@/context/showCart";
import { useRouter } from "next/navigation";
import { useRestaurantById } from "@/hooks/useRestaurant";
import { OutOfStockModal } from "@/components/OutOfStockModal";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";

interface OfferCardProps {
  offer: IPromoOfferFetched;
  viewMode: "list" | "grid";
  onEdit: (offer: IPromoOfferFetched) => void;
  onDetails: (offer: IPromoOfferFetched) => void;
  showActions?: boolean;
  toggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  viewMode,
  onEdit,
  onDetails,
  showActions = true,
  toggleFavorite,
  isFavorite,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { actionLoading } = useSelector((state: RootState) => state.promoOffer);
  const { allExtras, loading: extrasLoading } = useSelector(
    (state: RootState) => state.extra
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const [isPauseToggling, setIsPauseToggling] = useState(false);

  const bucketId = validateEnv().promoOfferBucketId;
  const offerImage = offer.image
    ? fileUrl(bucketId, offer.image)
    : "https://placehold.co/600x400/FF6B35/FFFFFF?text=No+Image&font=roboto";

  const extras = offer.extras || [];
  const isListView = viewMode === "list";
  const { setItem, setIsOpen } = useShowCart();
  const router = useRouter();

  const {
    restaurant,
    error: restaurantError,
    loading: restaurantLoading,
  } = useRestaurantById(offer.restaurantId || null);

  const isOutOfStock = !!offer.isPaused;
  const isAdmin = user?.role === "admin";

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const handleDeleteConfirm = () => {
    dispatch(
      deleteAsyncPromoOfferItem({
        itemId: offer.$id,
        imageId: offer.image || "",
      })
    );
    setIsDeleteModalOpen(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      setShowOutOfStockModal(true);
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    setItem({
      name: offer.name,
      category: offer.category,
      image: offer.image,
      itemId: offer.$id,
      price: offer.discountedPrice.toString(),
      quantity: 1,
      restaurantId: offer.restaurantId || "",
      userId: user.userId,
      source: "offer",
      extras: offer.extras || [],
      description: offer.description,
    });
    setIsOpen(true);
  };

  const handleCardClick = () => {
    if (isOutOfStock) {
      setShowOutOfStockModal(true);
    } else {
      onDetails(offer);
    }
  };

  const handlePauseToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent multiple clicks
    if (isPauseToggling || actionLoading === "pending") return;

    setIsPauseToggling(true);

    try {
      await dispatch(
        togglePausePromoOfferItem({
          itemId: offer.$id,
          isPaused: !isOutOfStock,
        })
      ).unwrap();

      // Keep button disabled for a short period to show feedback
      setTimeout(() => {
        setIsPauseToggling(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to toggle pause:", error);
      setIsPauseToggling(false);
    }
  };

  const renderRestaurantName = () => (
    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
      {restaurantLoading === "pending" ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : restaurantError ? (
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Error
        </span>
      ) : (
        <span>{restaurant?.name || "Restaurant not found"}</span>
      )}
    </div>
  );

  // Common overlay for out-of-stock (shown in both list & grid views)
  const OutOfStockOverlay = () => (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
      <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold mb-2">
        Out of Stock
      </div>
      <p className="text-white text-sm px-4 text-center">
        {offer.name} is currently unavailable.
      </p>
    </div>
  );

  // Common Pause/Resume Button with improved UX
  const PauseResumeButton = () => (
    <Button
      onClick={handlePauseToggle}
      disabled={isPauseToggling || actionLoading === "pending"}
      variant={isOutOfStock ? "default" : "outline"}
      size="sm"
      className={`relative z-20 transition-all ${
        isPauseToggling ? "scale-95" : ""
      }`}
    >
      {isPauseToggling ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {isOutOfStock ? "Resuming..." : "Pausing..."}
        </>
      ) : (
        <>
          {isOutOfStock ? (
            <Play className="w-4 h-4 mr-2" />
          ) : (
            <Pause className="w-4 h-4 mr-2" />
          )}
          {isOutOfStock ? "Resume" : "Pause"}
        </>
      )}
    </Button>
  );

  if (isListView) {
    return (
      <>
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
          onClick={handleCardClick}
        >
          {isOutOfStock && <OutOfStockOverlay />}
          <div className="flex gap-4 p-4">
            <div className="relative w-32 h-32 flex-shrink-0 rounded-md overflow-hidden">
              <Image
                src={offerImage}
                alt={offer.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {offer.name}
                </h3>
                {offer.restaurantId && renderRestaurantName()}
              </div>
              {showActions && (
                <div className="flex items-center gap-2 mb-2 relative z-20">
                  {toggleFavorite && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(offer.$id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetails(offer);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="View offer details"
                  >
                    <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  {/* Always show Pause/Resume for admin with higher z-index */}
                  {isAdmin && <PauseResumeButton />}
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(offer);
                          }}
                          disabled={actionLoading === "pending"}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600"
                          disabled={actionLoading === "pending"}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {offer.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(offer.originalPrice)}
                  </span>
                  <span className="text-xl font-bold text-orange-500">
                    {formatPrice(offer.discountedPrice)}
                  </span>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || actionLoading === "pending"}
                  variant={isOutOfStock ? "outline" : "default"}
                  size="sm"
                  className="relative z-20"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {isOutOfStock ? "Unavailable" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
        <DeleteOfferModal
          offer={offer}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          isDeleting={actionLoading === "pending"}
        />
        {showOutOfStockModal && (
          <OutOfStockModal
            itemName={offer.name}
            onClose={() => setShowOutOfStockModal(false)}
          />
        )}
      </>
    );
  }

  // Grid View (same logic)
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer group"
        onClick={handleCardClick}
      >
        {extras.length > 0 && extrasLoading !== "pending" && !isOutOfStock && (
          <div className="absolute top-2 left-2 flex gap-1 z-20">
            {extras.slice(0, 2).map((extraId, idx) => {
              const extra = allExtras.find(
                (e: IFetchedExtras) => e.$id === extraId
              );
              return extra ? (
                <span
                  key={idx}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full"
                >
                  {extra.name}
                </span>
              ) : null;
            })}
            {extras.length > 2 && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                +{extras.length - 2}
              </span>
            )}
          </div>
        )}
        {isOutOfStock && <OutOfStockOverlay />}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={offerImage}
            alt={offer.name}
            fill
            className="object-cover"
            sizes="300px"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {offer.name}
            </h3>
            {offer.restaurantId && renderRestaurantName()}
          </div>
          {showActions && (
            <div className="flex items-center gap-2 mb-2 relative z-20">
              {toggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(offer.$id);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDetails(offer);
                }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="View offer details"
              >
                <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              {/* Always show Pause/Resume for admin with higher z-index */}
              {isAdmin && <PauseResumeButton />}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(offer);
                      }}
                      disabled={actionLoading === "pending"}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600"
                      disabled={actionLoading === "pending"}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {offer.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(offer.originalPrice)}
              </span>
              <span className="text-xl font-bold text-orange-500">
                {formatPrice(offer.discountedPrice)}
              </span>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || actionLoading === "pending"}
              variant={isOutOfStock ? "outline" : "default"}
              size="sm"
              className="relative z-20"
            >
              <ShoppingBasket className="w-4 h-4 mr-2" />
              {isOutOfStock ? "Unavailable" : "Add"}
            </Button>
          </div>
        </div>
      </motion.div>
      <DeleteOfferModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={actionLoading === "pending"}
        offer={offer}
      />
      {showOutOfStockModal && (
        <OutOfStockModal
          onClose={() => setShowOutOfStockModal(false)}
          itemName={offer.name}
        />
      )}
    </>
  );
};

export default OfferCard;
