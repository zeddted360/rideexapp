// components/offers/OffersClient.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import AddPromoOfferForm from "@/components/AddPromoOfferForm";
import { listAsyncPromoOfferItems } from "@/state/offerSlice";
import OfferCard from "./OfferCard";
import SkeletonOfferCard from "./SkeletonOfferCard";
import EditOfferModal from "./EditOfferModal";
import DetailsModal from "./DetailsModal";
import { HeaderSection } from "./HeaderSection";
import { IPromoOfferFetched } from "../../../types/types";
import { Grid, List } from "lucide-react";

export function OffersClient() {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    offersItem: offers,
    listLoading,
    error,
  } = useSelector((state: RootState) => state.promoOffer);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedOffer, setSelectedOffer] = useState<IPromoOfferFetched | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showList, setShowList] = useState<boolean>(false);

  useEffect(() => {
    dispatch(listAsyncPromoOfferItems());
  }, [dispatch]);

  const handleOfferAdded = () => {
    dispatch(listAsyncPromoOfferItems());
  };

  const handleOrderNow = () => {
    setShowList(!showList);
    setViewMode("list");
  };

  const renderSkeletonCards = () => {
    const skeletons = Array.from({ length: 6 }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <SkeletonOfferCard viewMode={viewMode} />
      </motion.div>
    ));
    return (
      <div
        className={`grid gap-4 ${
          viewMode === "list"
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {skeletons}
      </div>
    );
  };

  const setSelectedOfferAndOpenEdit = (offer: IPromoOfferFetched) => {
    setSelectedOffer(offer);
    setIsEditModalOpen(true);
  };

  const setSelectedOfferAndOpenDetails = (offer: IPromoOfferFetched) => {
    setSelectedOffer(offer);
    setIsDetailsModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOffer(null);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOffer(null);
  };

  if (listLoading === "pending") {
    return (
      <div className="min-h-screen mt-4 bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-10 w-24" />
          </motion.div>
          <Skeleton className="h-32 w-full rounded-2xl mb-6" />
          {renderSkeletonCards()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-4 bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-200"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section - Now separated and editable */}
        <HeaderSection showList={showList} onOrderNow={handleOrderNow} />

        {/* View Toggle Section */}
        <ViewToggleSection
          showList={showList}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Offers List */}
        {showList && (
          <div
            className={`grid gap-4 ${
              viewMode === "list"
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {offers.map((offer, index) => (
              <motion.div
                key={offer.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <OfferCard
                  offer={offer}
                  viewMode={viewMode}
                  onEdit={setSelectedOfferAndOpenEdit}
                  onDetails={setSelectedOfferAndOpenDetails}
                  showActions={true}
                />
              </motion.div>
            ))}
          </div>
        )}

        <EditOfferModal
          offer={selectedOffer}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
        />
        <DetailsModal
          offer={selectedOffer}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
        />
      </div>
      {isAuthenticated && user?.role === "admin" && (
        <div className="fixed bottom-6 right-6 z-50">
          <AddPromoOfferForm onSuccess={handleOfferAdded} />
        </div>
      )}
    </div>
  );
}

// ViewToggleSection Component
function ViewToggleSection({
  viewMode,
  setViewMode,
  showList,
}: {
  showList: boolean;
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      {showList && (
        <div className="flex items-center justify-between gap-4 w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-orange-600">
            RideEx MiniMart
          </h2>
          <div className="flex gap-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("grid")}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </motion.button>
          </div>
        </div>
      )}
      <div></div> {/* Placeholder for layout balance */}
    </motion.div>
  );
}
