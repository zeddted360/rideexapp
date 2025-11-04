'use client';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Info, ShoppingBag, MoreVertical, Edit2, Trash2, Heart,Loader2, ShoppingBasket } from 'lucide-react';
import { IPromoOfferFetched } from '../../../types/types';
import { fileUrl, validateEnv } from '@/utils/appwrite';
import { deleteAsyncPromoOfferItem } from '@/state/offerSlice';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/authContext';
import DeleteOfferModal from './DeleteOfferModal';
import { useState } from 'react';
import { useShowCart } from '@/context/showCart';
import { useRouter } from 'next/navigation';
import { useRestaurantById } from '@/hooks/useRestaurant';

interface OfferCardProps {
  offer: IPromoOfferFetched;
  viewMode: 'list' | 'grid';
  onEdit: (offer: IPromoOfferFetched) => void;
  onDetails: (offer: IPromoOfferFetched) => void;
  showActions?: boolean;
  toggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

function OfferCard({
  offer,
  viewMode,
  onEdit,
  onDetails,
  showActions = true,
  toggleFavorite,
  isFavorite,
}: OfferCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const { actionLoading } = useSelector((state: RootState) => state.promoOffer);
  const { allExtras, loading: extrasLoading } = useSelector((state: RootState) => state.extra);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const bucketId = validateEnv().promoOfferBucketId;
  const offerImage = offer.image
    ? fileUrl(bucketId, offer.image)
    : 'https://placehold.co/600x400/FF6B35/FFFFFF?text=No+Image&font=roboto';
  const extras = offer.extras || [];
  const isListView = viewMode === 'list';
  const { setItem, setIsOpen } = useShowCart();
  const router = useRouter();
  const { restaurant, error: restaurantError, loading: restaurantLoading } = useRestaurantById(offer.restaurantId || null);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const handleDeleteConfirm = () => {
    dispatch(deleteAsyncPromoOfferItem({ itemId: offer.$id, imageId: offer.image || '' }));
    setIsDeleteModalOpen(false);
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setItem({
      name: offer.name,
      category: offer.category,
      image: offer.image,
      itemId: offer.$id,
      price: offer.discountedPrice.toString(),
      quantity: 1,
      restaurantId: offer.restaurantId || '',
      userId: user.userId,
      source: 'offer',
      extras: offer.extras || [],
      description:offer.description
    });
    setIsOpen(true);
  };

  const renderRestaurantName = () => (
    <div className="flex items-center gap-2 mt-1.5 text-xs text-orange-700 dark:text-orange-300">
      <ShoppingBasket className="w-3 h-3" />
      {restaurantLoading === 'pending' ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : restaurantError ? (
        <span className="text-xs text-red-500">Error</span>
      ) : (
        <span>{restaurant?.name || 'Restaurant not found'}</span>
      )}
    </div>
  );

  if (isListView) {
    return (
      <>
        <motion.div
          whileHover={{ y: -4, scale: 1 }}
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50"
        >
          <div className="flex items-center gap-4 p-4 sm:p-6">
            <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <Image
                src={offerImage}
                alt={offer.name}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">{offer.name}</h3>
                  {offer.restaurantId && renderRestaurantName()}
                </div>
                <div className="flex gap-2">
                  {showActions && (
                    <>
                      {toggleFavorite && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleFavorite(offer.$id)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                          />
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDetails(offer)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="View offer details"
                      >
                        <Info className="w-5 h-5 text-gray-400" />
                      </motion.button>
                      {user?.role === 'admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={actionLoading === 'pending'}
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                              aria-label="Offer actions"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-400" />
                            </motion.button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onEdit(offer)} disabled={actionLoading === 'pending'}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setIsDeleteModalOpen(true)}
                              className="text-red-600"
                              disabled={actionLoading === 'pending'}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  )}
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-3 line-clamp-1">{offer.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="text-gray-400 dark:text-gray-500 line-through text-sm">{formatPrice(offer.originalPrice)}</span>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{formatPrice(offer.discountedPrice)}</span>
                </div>
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-2 sm:ml-4 bg-white border-orange-500 hover:bg-orange-50 text-orange-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5"
                  aria-label="Add to cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add
                </motion.button>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </motion.div>
        <DeleteOfferModal
          offer={offer}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          isDeleting={actionLoading === 'pending'}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 hover:-translate-y-1"
      >
        {extras.length > 0 && extrasLoading !== 'pending' && (
          <div className="absolute top-2 left-2 z-10 flex gap-1">
            {extras.slice(0, 2).map((extraId, idx) => {
              const extra = allExtras.find((e) => e.$id === extraId);
              return extra ? (
                <motion.span
                  key={extraId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="bg-amber-500/90 text-white px-2 py-0.5 rounded text-xs font-semibold backdrop-blur-sm"
                >
                  {extra.name}
                </motion.span>
              ) : null;
            })}
            {extras.length > 2 && (
              <span className="bg-amber-500/90 text-white px-2 py-0.5 rounded text-xs font-semibold backdrop-blur-sm">
                +{extras.length - 2}
              </span>
            )}
          </div>
        )}
        <div className="relative w-full h-44 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
          <Image
            src={offerImage}
            alt={offer.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1">{offer.name}</h3>
                {offer.restaurantId && renderRestaurantName()}
              </div>
              <div className="flex gap-2">
                {showActions && (
                  <>
                    {toggleFavorite && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleFavorite(offer.$id)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart
                          className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                        />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDetails(offer)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="View offer details"
                    >
                      <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </motion.button>
                    {user?.role === 'admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={actionLoading === 'pending'}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            aria-label="Offer actions"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEdit(offer)} disabled={actionLoading === 'pending'}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="text-red-600"
                            disabled={actionLoading === 'pending'}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{offer.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-gray-400 dark:text-gray-500 line-through text-sm">{formatPrice(offer.originalPrice)}</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">{formatPrice(offer.discountedPrice)}</span>
            </div>
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-2 sm:ml-4 bg-white border-orange-500 hover:bg-orange-50 text-orange-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
              Add
            </motion.button>
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </motion.div>
      <DeleteOfferModal
        offer={offer}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={actionLoading === 'pending'}
      />
    </>
  );
}

export default OfferCard;