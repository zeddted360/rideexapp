'use client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/state/store';
import { listAsyncDiscounts } from '@/state/discountSlice';
import { useEffect, useState } from 'react';
import { fileUrl, validateEnv } from '@/utils/appwrite';
import { ShoppingCart, Heart, Clock, Info, Award, Check, Loader2, Utensils } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useShowCart } from '@/context/showCart';
import { useAuth } from '@/context/authContext';
import { IDiscountFetched } from '../../types/types';
import { Button } from './ui/button';
import { useRestaurantById } from '@/hooks/useRestaurant';
import { motion } from 'framer-motion';
import DiscountsSkeleton from './DiscountsSkeleton';

// New child component for rendering individual discount items
const DiscountItem = ({
  discount,
  index,
  favorites,
  toggleFavorite,
  handleApplyDeal,
}: {
  discount: IDiscountFetched;
  index: number;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  handleApplyDeal: (discount: IDiscountFetched) => void;
}) => {
  const { restaurant, loading, error } = useRestaurantById(discount.restaurantId || null);

  const getTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    if (diff < 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h left`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex-shrink-0 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Image Section */}
      <div className="relative">
        <div className="h-48 relative overflow-hidden">
          {discount.image ? (
            <Image
              src={fileUrl(validateEnv().discountBucketId || validateEnv().popularBucketId, discount.image as string)}
              alt={discount.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 80vw, 384px"
              quality={85}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center text-4xl">
              💸
            </div>
          )}
          {/* Discount Badge */}
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {discount.discountType === 'percentage' ? `${discount.discountValue}%` : `₦${discount.discountValue}`}
          </div>
          {/* Active Badge */}
          {discount.isActive && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Check className="w-3 h-3" />
              Active
            </div>
          )}
          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(discount.$id)}
            className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 transform hover:scale-110"
            aria-label={favorites.has(discount.$id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 ${favorites.has(discount.$id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-4">
        <div className="space-y-3">
          {/* Restaurant Name */}
          {discount.restaurantId && (
            <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300">
              <Utensils className="w-3 h-3" />
              {loading === 'pending' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : error ? (
                <span className="text-xs text-red-500">Error</span>
              ) : (
                <span>{restaurant?.name || 'Restaurant not found'}</span>
              )}
            </div>
          )}

          {/* Title */}
          <div className="flex items-start gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-1 line-clamp-1">{discount.title}</h3>
            <button
              className="bg-orange-100 text-orange-600 p-1.5 rounded-full hover:bg-orange-200 transition-colors"
              aria-label="View discount details"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Scope & Validity */}
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">{discount.appliesTo}</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="font-medium">{getTimeLeft(discount.validTo)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{discount.description}</p>

          {/* Price & Conditions */}
          <div className="flex flex-col gap-2">
            {discount.originalPrice && (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-orange-600">
                  {discount.discountedPrice ||
                    `Save ${discount.discountValue}${discount.discountType === 'percentage' ? '%' : ''}`}
                </span>
                <span className="text-sm text-gray-400 line-through">{discount.originalPrice}</span>
              </div>
            )}
            {discount.minOrderValue && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Min order: {discount.minOrderValue}
              </div>
            )}
            {discount.code && (
              <div className="text-xs text-gray-500 dark:text-gray-400">Code: {discount.code}</div>
            )}
          </div>
        </div>

        <Button
          aria-label={`Apply ${discount.title}`}
          onClick={() => handleApplyDeal(discount)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Apply Deal
        </Button>
      </div>
    </motion.div>
  );
};

export default function DiscountsList() {
  const [favorites, setFavorites] = useState(new Set<string>());
  const [discounts, setDiscounts] = useState<IDiscountFetched[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { discounts: reduxDiscounts } = useSelector(
    (state: RootState) => state.discounts
  );
  const { user } = useAuth();
  const router = useRouter();
  const { setItem, setIsOpen } = useShowCart();

  // Fetch discounts
  useEffect(() => {
    dispatch(listAsyncDiscounts());
  }, [dispatch]);

  // Filter active and non-expired discounts
  useEffect(() => {
    if (reduxDiscounts) {
      const now = new Date().toISOString();
      const activeDiscounts = reduxDiscounts.filter(
        (d: IDiscountFetched) =>
          d.isActive &&
          d.isApproved &&
          new Date(d.validFrom) <= new Date(now) &&
          new Date(now) <= new Date(d.validTo)
      );
      setDiscounts(activeDiscounts);
      setLoadingDiscounts(false);
    }
  }, [reduxDiscounts]);

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const handleApplyDeal = (discount: IDiscountFetched) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const basePrice = discount.originalPrice
      ? parseFloat(discount.originalPrice.toString().replace(/[₦,]/g, ""))
      : 0;
    let discountedPrice = discount.discountedPrice || basePrice;

    if (!discount.discountedPrice) {
      if (discount.discountType === "percentage") {
        discountedPrice = basePrice * (1 - discount.discountValue / 100);
      } else {
        discountedPrice = basePrice - discount.discountValue;
      }
    }
    setItem({
      userId: user.userId as string,
      itemId: discount.$id,
      name: discount.title,
      image: discount.image as string,
      price: discountedPrice.toString(),
      restaurantId: discount.restaurantId || "",
      quantity: 1,
      category: "discount",
      source: "discount",
      description: discount.description,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      minOrderValue: discount.minOrderValue,
      maxUses: discount.maxUses,
      validFrom: discount.validFrom,
      validTo: discount.validTo,
    });
    setIsOpen(true);
  };

  // In DiscountsList, replace the loading return:
  if (loadingDiscounts) {
    return (
      <div className="py-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Today's Deals & Discounts
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          </div>
          <DiscountsSkeleton />
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Today's Deals & Discounts
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
        </div>

        {discounts.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            {discounts.map((discount, index) => (
              <div key={discount.$id} className="snap-start">
                <DiscountItem
                  discount={discount}
                  index={index}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  handleApplyDeal={handleApplyDeal}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3 mx-auto">
              <Award className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Active Discounts
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Check back soon for amazing deals!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}