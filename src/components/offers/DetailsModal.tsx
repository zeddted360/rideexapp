'use client';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { IPromoOfferFetched, IFetchedExtras } from '../../../types/types';
import { Button } from '@/components/ui/button';
import { X, Tag, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { fileUrl, validateEnv } from '@/utils/appwrite';
import { fetchExtraById } from '@/state/extraSlice';
import { AppDispatch } from '@/state/store';

interface DetailsModalProps {
  offer: IPromoOfferFetched | null;
  isOpen: boolean;
  onClose: () => void;
}

function DetailsModal({ offer: propOffer, isOpen, onClose }: DetailsModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [fetchedExtras, setFetchedExtras] = useState<IFetchedExtras[]>([]);
  const [extrasLoading, setExtrasLoading] = useState<boolean>(false);
  const offer = propOffer;

  // Memoize offer to prevent unnecessary re-renders
  const memoizedOffer = useMemo(() => offer, [offer]);

  // Fetch extra details when modal opens or offer.extras changes
  useEffect(() => {
    if (memoizedOffer?.extras && memoizedOffer.extras.length > 0) {
      setExtrasLoading(true);
      setFetchedExtras([]); // Reset to show loading
      const fetchPromises = memoizedOffer.extras.map((extraId: string) =>
        dispatch(fetchExtraById(extraId))
          .unwrap()
          .catch((err: unknown) => {
            console.warn(`Failed to fetch extra ${extraId}:`, err);
            return null; // Ignore individual failures
          })
      );
      Promise.all(fetchPromises).then((results) => {
        const validExtras = results.filter((extra): extra is IFetchedExtras => extra !== null);
        setFetchedExtras(validExtras);
        setExtrasLoading(false);
      });
    } else {
      setFetchedExtras([]);
      setExtrasLoading(false);
    }
  }, [memoizedOffer?.extras, dispatch]);

  // Early return before rendering if not open or no offer
  if (!isOpen || !memoizedOffer) return null;

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return Number.isFinite(numPrice) ? `₦${numPrice.toLocaleString()}` : '₦0';
  };

  const bucketId = validateEnv().promoOfferBucketId;
  const offerImage = memoizedOffer.image
    ? fileUrl(bucketId, memoizedOffer.image)
    : 'https://placehold.co/600x400/FF6B35/FFFFFF?text=No+Image&font=roboto';

  // Calculate savings
  const savings = memoizedOffer.originalPrice - memoizedOffer.discountedPrice;
  const savingsPercent = Number.isFinite(savings / memoizedOffer.originalPrice)
    ? Math.round((savings / memoizedOffer.originalPrice) * 100)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Header with Image */}
            <div className="relative h-56 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-700 dark:to-gray-800">
              <Image
                src={offerImage}
                alt={memoizedOffer.name}
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Savings Badge */}
              {savingsPercent > 0 && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Save {savingsPercent}%
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{memoizedOffer.name}</h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{memoizedOffer.description}</p>

              {/* Price Section */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Original Price</p>
                    <p className="text-lg text-gray-400 dark:text-gray-500 line-through font-medium">
                      {formatPrice(memoizedOffer.originalPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Offer Price</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                      {formatPrice(memoizedOffer.discountedPrice)}
                    </p>
                  </div>
                </div>

                {savings > 0 && (
                  <div className="border-t border-orange-200 dark:border-gray-600 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">You Save:</span>
                      <span className="font-bold text-green-600 dark:text-green-500">
                        {formatPrice(savings)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Add-ons Section */}
              {memoizedOffer.extras && memoizedOffer.extras.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Included Add-ons
                    </h4>
                  </div>
                  {extrasLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin mr-2 text-orange-600" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Loading add-ons...</span>
                    </div>
                  ) : fetchedExtras.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {fetchedExtras.map((extra) => (
                        <motion.span
                          key={extra.$id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-800 flex items-center gap-1 shadow-sm hover:shadow-md transition-shadow"
                        >
                          {extra.name}
                          <span className="text-amber-600 dark:text-amber-300 font-semibold text-[10px]">
                            +{formatPrice(extra.price)}
                          </span>
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center">
                      No add-ons available
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default DetailsModal;