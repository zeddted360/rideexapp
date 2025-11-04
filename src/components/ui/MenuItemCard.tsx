import React from "react";
import Image from "next/image";
import { IMenuItemFetched } from "@/../types/types";
import { Button } from "./button";
import { useShowCart } from "@/context/showCart";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { Plus } from "lucide-react";

interface MenuItemCardProps {
  item: IMenuItemFetched;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { setIsOpen, setItem } = useShowCart();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100 dark:border-gray-700">
      <div className="relative w-full h-40">
        <Image
          src={fileUrl(validateEnv().menuBucketId, item.image)}
          alt={item.name}
          fill
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          quality={100}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg mb-1.5 truncate text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {item.name}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-500 font-bold text-xl">
                ₦{item.price.toLocaleString()}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-gray-400 dark:text-gray-500 text-sm font-medium line-through decoration-2 decoration-gray-300 dark:decoration-gray-600">
                  ₦{item.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <Button
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-4 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
            aria-label={`Add ${item.name} to cart`}
            onClick={() => {
              if (user) {
                setItem({
                  userId: user.userId as string,
                  itemId: item.$id,
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  restaurantId: item.restaurantId,
                  quantity: 1,
                  category: item.category,
                  source: "menu",
                  description: item.description,
                  extras: item.extras,
                });
                setIsOpen(true);
              } else {
                router.push("/login");
              }
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard; 