"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { 
  X,
  Clock,
  Settings
} from 'lucide-react';
import { fileUrl, validateEnv, storage, client } from '@/utils/appwrite';
import { Models } from 'appwrite';
import toast from 'react-hot-toast';
import { IRestaurantFetched } from '../../types/types';
import { AppDispatch, RootState } from '@/state/store';
import { listAsyncRestaurants } from '@/state/restaurantSlice';
import { listAsyncLogos } from '@/state/categoryLogosSlice';
import { useAuth } from '@/context/authContext';
import CategoryLogoManager from './CategoryLogoManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CategoryItem {
  id: string;
  title: string;
  href: string;
  available: boolean;
  image?: string; 
  icon?: any;
}

const MiniNavigation = () => {
  const [isClient, setIsClient] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CategoryItem | IRestaurantFetched | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { restaurants, loading, error } = useSelector((state: RootState) => state.restaurant);
  const { logos } = useSelector((state: RootState) => state.categoryLogos);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { restaurantBucketId, categoryLogosBucketId } = validateEnv();

  useEffect(() => {
    setIsClient(true);
    dispatch(listAsyncRestaurants());
    dispatch(listAsyncLogos());
  }, [dispatch]);

  useEffect(() => {
    if (!isClient) return;

    const channel = `buckets.${categoryLogosBucketId}.files`;
    const unsubscribe = client.subscribe(channel, (payload) => {
      if (payload.events && payload.events.some(event => 
        event.startsWith('storage.buckets.') && event.includes('.files')
      )) {
        dispatch(listAsyncLogos());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [categoryLogosBucketId, isClient, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const mainCategories: CategoryItem[] = [
    {
      id: 'restaurant',
      title: 'Restaurant',
      href: '/menu',
      available: true,
      image: logos.restaurant ? fileUrl(categoryLogosBucketId, logos.restaurant.$id) : '/shopping_cart.jpg',
    },
    {
      id: 'shops',
      title: 'Shops',
      href: '/shops',
      available: false,
      image: logos.shops ? fileUrl(categoryLogosBucketId, logos.shops.$id) : '/home.jpg',
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      href: '/pharmacy',
      available: false,
      image: logos.pharmacy ? fileUrl(categoryLogosBucketId, logos.pharmacy.$id) : '/hospital.jpg',
    },
  ];

  const handleItemClick = (item: CategoryItem | IRestaurantFetched, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSelectedItem(item);
    setShowComingSoon(true);
  };

  const closeModal = () => {
    setShowComingSoon(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showComingSoon) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showComingSoon]);

  const renderCategoryItem = (item: CategoryItem | IRestaurantFetched, isExploreItem: boolean = false) => {
    const containerSize = isExploreItem ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-16 h-16 sm:w-18 sm:h-18';
    const iconSize = isExploreItem ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-9 sm:h-9';
    const isRestaurant = '$id' in item;

    const imageUrl = isRestaurant && item.logo 
      ? fileUrl(restaurantBucketId, item.logo as string)
      : (item as CategoryItem).image || '/placeholder.jpg';

    if (item.available) {
      return (
        <Link
          key={isRestaurant ? item.$id : item.id}
          href={item.href}
          className="group flex flex-col items-center min-w-[100px] sm:min-w-[110px] snap-center transition-transform duration-300 hover:scale-105"
        >
          <div className={`relative flex items-center justify-center ${containerSize} ${isExploreItem ? 'rounded-full' : 'rounded-2xl'} overflow-hidden bg-gray-100/90 dark:bg-gray-800/90 group-hover:bg-orange-100/40 dark:group-hover:bg-orange-900/40 transition-all duration-300 shadow-md group-hover:shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50`}>
            <Image
              src={imageUrl}
              alt={isRestaurant ? item.name : item.title}
              fill
              sizes="(max-width: 640px) 80px, 100px"
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              quality={85}
              priority={!isExploreItem}
            />
          </div>
          <span className="mt-3 text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300 text-center line-clamp-1">
            {isRestaurant ? item.name : item.title}
          </span>
        </Link>
      );
    } else {
      const Icon = (item as CategoryItem).icon;
      return (
        <button
          key={isRestaurant ? item.$id : item.id}
          onClick={(e) => handleItemClick(item, e)}
          type="button"
          aria-label={`${isRestaurant ? item.name : item.title} - Coming Soon`}
          className="group flex flex-col items-center min-w-[100px] sm:min-w-[110px] snap-center transition-transform duration-300 hover:scale-105"
        >
          <div className={`relative flex items-center justify-center ${containerSize} ${isExploreItem ? 'rounded-full' : 'rounded-2xl'} overflow-hidden bg-gray-100/90 dark:bg-gray-800/90 group-hover:bg-orange-100/40 dark:group-hover:bg-orange-900/40 transition-all duration-300 shadow-md group-hover:shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50`}>
            {Icon ? (
              <Icon
                className={`${iconSize} text-gray-600 dark:text-gray-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300 opacity-70 group-hover:opacity-100`}
              />
            ) : (
              <Image
                src={imageUrl}
                alt={isRestaurant ? item.name : item.title}
                fill
                sizes="(max-width: 640px) 80px, 100px"
                className="object-cover opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300"
                quality={85}
              />
            )}
            <div className="absolute top-0 right-0 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center translate-x-1/3 -translate-y-1/3 shadow-md ring-1 ring-white/50">
              <Clock className="w-3 h-3 text-white" />
            </div>
          </div>
          <span className="mt-3 text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300 text-center opacity-70 group-hover:opacity-100 line-clamp-1">
            {isRestaurant ? item.name : item.title}
          </span>
        </button>
      );
    }
  };

  const ComingSoonModal = () => {
    if (!showComingSoon || !selectedItem) return null;
    const isRestaurant = '$id' in selectedItem;
    const imageUrl = isRestaurant && selectedItem.logo 
      ? fileUrl(restaurantBucketId, selectedItem.logo as string)
      : (selectedItem as CategoryItem).image || '/placeholder.jpg';

    const Icon = (selectedItem as CategoryItem).icon;

    return (
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
      >
        <div 
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl ring-1 ring-gray-200/50 dark:ring-gray-800/50"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-lg overflow-hidden bg-orange-100/50 dark:bg-orange-900/50 shadow-sm">
                {Icon ? (
                  <Icon className="w-7 h-7 text-orange-500 dark:text-orange-400" />
                ) : (
                  <Image
                    src={imageUrl}
                    alt={isRestaurant ? selectedItem.name : selectedItem.title}
                    fill
                    className="object-cover"
                    quality={85}
                    priority
                    sizes='(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw'
                  />
                )}
              </div>
              <h2 id="coming-soon-title" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isRestaurant ? selectedItem.name : selectedItem.title}
              </h2>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
              {Icon ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-white opacity-90" />
                  <Clock className="absolute w-10 h-10 text-white/80" />
                </div>
              ) : (
                <>
                  <Image
                    src={imageUrl}
                    alt={isRestaurant ? selectedItem.name : selectedItem.title}
                    fill
                    className="object-cover opacity-80"
                    quality={85}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Clock className="w-10 h-10 text-white" />
                  </div>
                </>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Coming Soon!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed px-4">
              {`We're working hard to bring you ${isRestaurant ? selectedItem.name.toLowerCase() : selectedItem.title.toLowerCase()} services. Stay tuned for updates!`}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={closeModal}
              className="flex-1 py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Got it
            </button>
            <button
              onClick={closeModal}
              className="flex-1 py-3 px-6 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Notify Me
            </button>
          </div>
        </div>
      </div>
    );
  };

  const content = (
    <section className="mb-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200/50 dark:border-gray-800/50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="space-y-8 sm:space-y-10">
          {isAdmin && (
            <div className="flex justify-end -mt-2 mb-4">
              <button
                onClick={() => setShowAdminModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
                aria-label="Manage category logos"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Logos</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-10 sm:gap-12 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
            {mainCategories.map((category) => renderCategoryItem(category))}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                Explore
              </h2>
              {restaurants.length > 0 && (
                <Link href="/menu" className="text-sm sm:text-base font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200">
                  See All
                </Link>
              )}
            </div>
            {loading === 'pending' ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
              </div>
            ) : restaurants.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                No restaurants available at the moment
              </p>
            ) : (
              <div className="flex items-center justify-start gap-10 sm:gap-12 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
                {restaurants.filter(r=>r.isPaused !== true).map((restaurant) => renderCategoryItem({ ...restaurant, href: `/restaurant/${restaurant.$id}`, available: true }, true))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Manage Category Logos</DialogTitle>
          </DialogHeader>
          <CategoryLogoManager />
        </DialogContent>
      </Dialog>

      <ComingSoonModal />
    </section>
  );

  if (!isClient) return content;
  return content;
};

export default MiniNavigation;