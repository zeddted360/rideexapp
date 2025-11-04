'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import AddPromoOfferForm from '@/components/AddPromoOfferForm';
import { listAsyncPromoOfferItems } from '@/state/offerSlice';
import OfferCard from './OfferCard';
import SkeletonOfferCard from './SkeletonOfferCard';
import EditOfferModal from './EditOfferModal';
import DetailsModal from './DetailsModal';
import { IPromoOfferFetched } from '../../../types/types';
import { ArrowRight, Grid, List, ShoppingCart, Sparkles } from 'lucide-react';

export function OffersClient() {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { offersItem: offers, listLoading, error } = useSelector((state: RootState) => state.promoOffer);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedOffer, setSelectedOffer] = useState<IPromoOfferFetched | null>(null);
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
    setViewMode('list');
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
      <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {skeletons}
      </div>
    );
  };

  if (listLoading === 'pending') {
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
        <HeaderSection showList={showList} onOrderNow={handleOrderNow} />
        <ViewToggleSection showList={showList} viewMode={viewMode} setViewMode={setViewMode} />
        {showList && 
        <div  className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
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
        }
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

  function setSelectedOfferAndOpenEdit(offer: IPromoOfferFetched) {
    setSelectedOffer(offer);
    setIsEditModalOpen(true);
  }

  function setSelectedOfferAndOpenDetails(offer: IPromoOfferFetched) {
    setSelectedOffer(offer);
    setIsDetailsModalOpen(true);
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false);
    setSelectedOffer(null);
  }

  function handleCloseDetailsModal() {
    setIsDetailsModalOpen(false);
    setSelectedOffer(null);
  }
}

// HeaderSection Component
function HeaderSection({ onOrderNow,showList}: { onOrderNow: () => void,showList:boolean,}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 p-6 sm:p-8 mb-6 shadow-xl"
    >
      <div className="absolute inset-0 bg-black/5"></div>
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative flex-shrink-0"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
              <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-3 h-3 text-orange-800" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              RideEx MiniMart
            </h2>
            <p className="text-orange-50 text-sm">
              Shop groceries, drinks, and essentials
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOrderNow}
          className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group"
        >
          {showList ? "Hide Items" : "Order Now"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
      <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-4 left-4 w-10 h-10 bg-amber-400/20 rounded-full blur-lg"></div>
    </motion.div>
  );
}

// ViewToggleSection Component
function ViewToggleSection({ viewMode, setViewMode,showList }: {showList:boolean, viewMode: 'list' | 'grid'; setViewMode: (mode: 'list' | 'grid') => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      {
        showList &&
      <div  className="flex items-center justify-between gap-4 w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-orange-600">RideEx CloudMart</h2>
        <div className="flex gap-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('grid')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </motion.button>
        </div>
      </div>
}
      <div></div> {/* Placeholder for layout balance */}
    </motion.div>
  );
}