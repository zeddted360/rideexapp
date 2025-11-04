'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Star, Plus, Clock, Loader2, Heart } from 'lucide-react';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { fileUrl, validateEnv } from '@/utils/appwrite';
import { IMenuItemFetched } from '../../../../types/types';
import { useShowCart } from '@/context/showCart';

interface MenuItemCardProps {
  item: IMenuItemFetched;
  restaurantId: string;
}

export const RestaurantMenuItem: React.FC<MenuItemCardProps> = ({ item, restaurantId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { setIsOpen, setItem, } = useShowCart();


  const handleAddToCart = async () => {
    if(user) {
      setItem({
        userId: user.userId,
        itemId: item.$id,
        name: item.name,
        image: item.image,
        price: item.price,
        restaurantId,
        quantity: 1,
        category: item.category,
        source: 'menu' as const,
        extras:item.extras,
      })
      setIsOpen(true);
    }else {
      router.push("/login");

    }
  }

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites', {
      duration: 2000,
      position: 'top-right',
    });
  };

  const getImageUrl = (imageId: string) => {
    try {
      return fileUrl(validateEnv().menuBucketId, imageId);
    } catch (error) {
      console.error('Error generating image URL:', error);
      return '/fallback-food.webp';
    }
  };

  const price = parseFloat(item.price);
  const originalPrice = item.originalPrice ? parseFloat(item.originalPrice) : null;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800 transform hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        {!imageError ? (
          <Image
            src={getImageUrl(item.image)}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <p className="text-sm">Image not available</p>
            </div>
          </div>
        )}
        
        {/* Overlay Elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-white"
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'} transition-colors`} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-900">{item.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {item.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 mb-3">
            {item.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center px-2.5 py-1 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
              {item.category}
            </span>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>{item.cookTime}</span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              ₦{price.toLocaleString()}
            </div>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                ₦{originalPrice!.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 disabled:transform-none disabled:hover:scale-100"
        >
            <div className="flex items-center justify-center group/btn">
              <Plus className="w-5 h-5 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" />
              <span>Add to Cart</span>
            </div>
        </Button>
      </div>
    </div>
  );
};