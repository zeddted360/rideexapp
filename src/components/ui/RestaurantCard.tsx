import Image from "next/image";
import { IRestaurantFetched } from "../../../types/types";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { Star } from "lucide-react";

// Restaurant card component
const RestaurantCard = ({ restaurant }: { restaurant: IRestaurantFetched }) => (
  <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-auto hover:scale-105 focus-within:ring-2 focus-within:ring-orange-500">
    <div className="relative">
      <div className="w-full h-28 sm:h-32 md:h-36 overflow-hidden rounded-t-xl">
        <Image
          src={fileUrl(validateEnv().restaurantBucketId, restaurant.logo as string)}
          alt={restaurant.name}
          width={200}
          height={150}
          quality={100}
          priority
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 25vw"
        />
      </div>
      <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-opacity duration-200 group-hover:opacity-90">
        <Star className="w-3 h-3 fill-current" />
        <span>{restaurant.rating}</span>
      </div>
    </div>
    <div className="p-3 sm:p-4">
      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 line-clamp-1">
        {restaurant.name}
      </h3>
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 sm:space-y-2">
        <p className="line-clamp-1 font-medium">{restaurant.category}</p>
        <div className="flex items-center gap-2 sm:gap-4 text-gray-500 dark:text-gray-400 text-xs">
          <span className="truncate">{restaurant.deliveryTime}</span>
          <span className="truncate">{restaurant.distance}</span>
        </div>
      </div>
    </div>
  </div>
);

export default RestaurantCard;