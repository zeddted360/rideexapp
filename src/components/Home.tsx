"use client";
import FeaturedItem from "@/components/FeaturedItem";
import Menu from "@/components/Menu";
import PromotionalBanner from "@/components/PromotionalBanner";
import PopularItem from "@/components/PopularItem";
import { useState, useEffect } from "react";
import MiniNavigation from "@/components/Hero";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { listAllAsyncExtras } from "@/state/extraSlice";
import { usePathname } from "next/navigation";
import DiscountsList from "./DiscountList";
import OffersSection from "./OffersSection"; 
import { useRouter } from "next/navigation";

export default function HomeClient() {
  const dispatch = useDispatch<AppDispatch>();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const {
    offersItem: offers,
    listLoading,
    error,
  } = useSelector((state: RootState) => state.promoOffer);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    dispatch(listAllAsyncExtras()); 
  }, [dispatch]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pt-20">
      <MiniNavigation />
      <Menu />
      <FeaturedItem toggleFavorite={toggleFavorite} favorites={favorites} />
      <PromotionalBanner />
      <OffersSection /> 
      <PopularItem toggleFavorite={toggleFavorite} favorites={favorites} />
      <DiscountsList />
    </div>
  );
}
