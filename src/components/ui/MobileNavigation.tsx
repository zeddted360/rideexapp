"use client";
import { useState, useEffect } from "react";
import { Home, Menu, ShoppingBag, User, Shield, ShoppingBasket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useShowCart } from "@/context/showCart";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { useAuth } from "@/context/authContext";
import ProfileDropdown from "./ProfileDropdown";

const MobileNavigation = () => {
  const router = useRouter();
  const { setActiveCart } = useShowCart();
  const { orders } = useSelector((state: RootState) => state.orders);
  const { isAuthenticated, user } = useAuth();

  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Navigation handlers
  const handleHomeClick = () => {
    router.push("/");
  };

  const handleMenuClick = () => {
    router.push("/menu");
  };

  const handleOffersClick = () => {
    router.push("/offers");
  };

  const handleCartClick = () => {
    if (Array.isArray(orders) && orders.length > 0) {
      setActiveCart(true);
    } else {
      router.push("/myorders");
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  };

  if (!isClient || !isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="relative flex items-center justify-between py-2 px-4">
        {/* Left side buttons */}
        <div className="flex items-center space-x-6">
          <button
            onClick={handleHomeClick}
            className="flex flex-col items-center py-2 px-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <Home className="w-5 h-5 mb-1" color="#f97316" />
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={handleMenuClick}
            className="flex flex-col items-center py-2 px-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors relative"
          >
            <Menu className="w-5 h-5 mb-1" color="#f97316" />
            <span className="text-xs">Menu</span>
          </button>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-6">
          {/* Search button to make it 5 buttons for better centering */}
          {user?.role !== "admin" && (
            <button
              onClick={handleOffersClick}
              className="flex flex-col items-center py-2 px-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              <ShoppingBasket className="w-5 h-5 mb-1" color="#f97316" />
              <span className="text-xs">Offers</span>
            </button>
          )}

          {/* Admin Dashboard button for admin users only */}
          {isAuthenticated && user?.isAdmin && (
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex flex-col items-center py-2 px-2 text-gray-500 hover:text-orange-500 transition-colors"
            >
              <Shield className="w-5 h-5 mb-1" color="#f97316" />
              <span className="text-xs font-medium">Admin</span>
            </button>
          )}

          {isAuthenticated ? (
            <div className="md:hidden">
              <ProfileDropdown>
                <button className="flex flex-col items-center py-2 px-2 text-gray-500 hover:text-orange-500 transition-colors">
                  <User className="w-5 h-5 mb-1" color="#f97316" />
                  <span className="text-xs font-medium">Profile</span>
                </button>
              </ProfileDropdown>
            </div>
          ) : (
            <button
              onClick={handleProfileClick}
              className="flex flex-col items-center py-2 px-2 text-gray-500 hover:text-orange-500 transition-colors"
            >
              <User className="w-5 h-5 mb-1" color="#f97316" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          )}
        </div>

        {/* Centralized Circular Cart Button - Slightly Raised and Perfectly Centered */}
        <button
          onClick={handleCartClick}
          className="absolute left-1/2 transform -translate-x-1/2 bottom-10 border-4 bg-orange-500 text-white rounded-full p-3 shadow-2xl hover:bg-orange-600 transition-all duration-200 z-10 flex flex-col items-center"
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            {Array.isArray(orders) && orders.length > 0 && (
              <span className="absolute -top-4 -right-4 bg-white text-orange-500 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-orange-500">
                {orders.length}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation;
