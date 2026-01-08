// components/DiscountsList.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { Award } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useShowCart } from "@/context/showCart";
import { IDiscountFetched } from "../../types/types";
import DiscountsSkeleton from "./DiscountsSkeleton";
import { listAsyncDiscounts } from "@/state/discountSlice";
import { DiscountItem } from "./DiscountItem";

export default function DiscountsList() {
  const [favorites, setFavorites] = useState(new Set<string>());
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { discounts: reduxDiscounts } = useSelector(
    (state: RootState) => state.discounts
  );
  const { user } = useAuth();
  const router = useRouter();
  const { setItem, setIsOpen } = useShowCart();

  useEffect(() => {
    dispatch(listAsyncDiscounts());
  }, [dispatch]);

  const activeDiscounts = useMemo(() => {
    if (!reduxDiscounts) return [];

    const now = new Date().toISOString();
    return reduxDiscounts.filter(
      (d: IDiscountFetched) =>
        d.isActive &&
        d.isApproved &&
        new Date(d.validFrom) <= new Date(now) &&
        new Date(now) <= new Date(d.validTo)
    );
  }, [reduxDiscounts]);

  const displayedDiscounts = useMemo(() => {
    if (activeDiscounts.length === 0) return [];

    if (activeDiscounts.length <= 2) return [...activeDiscounts];

    const shuffled = [...activeDiscounts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 2);
  }, [activeDiscounts]);

  useEffect(() => {
    if (reduxDiscounts) {
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
          <div className="flex overflow-x-auto gap-4 pb-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <DiscountsSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Today's Deals & Discounts
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
        </div>

        {displayedDiscounts.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            {displayedDiscounts.map((discount, index) => (
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
