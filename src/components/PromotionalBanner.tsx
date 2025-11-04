"use client";
import { useEffect, useState } from "react";
import { databases,  validateEnv } from "@/utils/appwrite";
import { Query } from "appwrite";
import { IPromoOfferFetched } from "../../types/types";
import PromotionalImageManager from "./PromotionalImageManager";

export default function PromotionalBanner() {
  const [offers, setOffers] = useState<IPromoOfferFetched[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);
      const response = await databases.listDocuments(
        validateEnv().databaseId,
        validateEnv().promoOfferCollectionId,
        [Query.orderDesc("$createdAt")]
      );
      setOffers(response.documents as IPromoOfferFetched[]);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  if (loadingOffers) {
    return (
      <div className="py-12  to-red-50 dark:from-gray-900 dark:to-gray-800 space-y-6">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl mx-auto max-w-4xl"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xl mx-auto max-w-4xl"></div>
      </div>
    );
  }

  return (
    <div className="py-12  dark:from-gray-900 dark:to-gray-800">
            <PromotionalImageManager />
    </div>
  );
}