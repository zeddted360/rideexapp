"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import { deleteOrderAsync, resetOrders } from "@/state/orderSlice";
import toast from "react-hot-toast";
import { useAuth } from "@/context/authContext";
import { logoutAsync } from "@/state/authSlice";
import { useLanguage } from "@/context/languageContext";
import { useTranslation } from "react-i18next";
import {
    Globe,
  Search,
  ShoppingCart,
  Star,
  Sun,
  UserCircle,
  Utensils,
} from "lucide-react";
import { ISearchResult } from "../../../types/types";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { Button } from "../ui/button";
import Logo from "./Logo";
import DesktopSearch from "./DesktopSearch";
import RightActions from "./RightActions";
import MobileNav from "./MobileNav";
import MobileSearch from "./MobileSearch";
import DesktopNav from "./DesktopNav";
import { useShowCart } from "@/context/showCart";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ISearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Get data from Redux store
  const { restaurants } = useSelector((state: RootState) => state.restaurant);
  const { menuItems } = useSelector((state: RootState) => state.menuItem);
  const { popularItems } = useSelector((state: RootState) => state.popularItem);
  const { featuredItems } = useSelector(
    (state: RootState) => state.featuredItem
  );
  const { orders } = useSelector((state: RootState) => state.orders);
  const { user, isAuthenticated, role } = useAuth();
  const userId = user?.userId;
  const cartItems = orders || [];
  const { currentLanguage, changeLanguage, isLanguageLoading } = useLanguage();
  const { t } = useTranslation();
  const {setItem, setIsOpen} = useShowCart();

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results: ISearchResult[] = [];

    // Search restaurants
    restaurants.forEach((restaurant: any) => {
      if (
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.description?.toLowerCase().includes(query) ||
        restaurant.category?.toLowerCase().includes(query)
      ) {
        results.push({
          id: restaurant.$id,
          name: restaurant.name,
          type: "restaurant",
          image: restaurant.logo, // Use logo as image for restaurants
          description: restaurant.description,
          category: restaurant.category,
          rating: restaurant.rating,
          deliveryTime: restaurant.deliveryTime,
          distance: restaurant.distance,
          slug: restaurant.name, // Use name directly for slug (to match page query by name)
        });
      }
    });

    // Search menu items
    menuItems.forEach((item: any) => {
      if (
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      ) {
        results.push({
          id: item.$id,
          name: item.name,
          type: "menu",
          image: item.image,
          price: item.price,
          description: item.description,
          category: item.category,
          restaurantName: item.restaurantName,
          restaurantId: item.restaurantId || "unknown", // Assume available or fallback
        });
      }
    });

    // Search popular items
    popularItems.forEach((item: any) => {
      if (
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      ) {
        results.push({
          id: item.$id || String(item.id), // Ensure string, fallback to 'undefined' if both missing but unlikely
          name: item.name,
          type: "popular",
          image: item.image,
          price: item.price,
          description: item.description,
          category: item.category,
          restaurantName: item.restaurantName || `Popular ${item.category}`,
          restaurantId: item.restaurantId || "unknown",
        });
      }
    });

    // Search featured items
    featuredItems.forEach((item: any) => {
      if (
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      ) {
        results.push({
          id: item.$id, // Assuming $id always present for fetched items
          name: item.name,
          type: "featured",
          image: item.image,
          price: item.price,
          description: item.description,
          category: item.category,
          restaurantName: item.restaurantName || `Featured from ${item.restaurant}`,
          restaurantId: item.restaurant || "unknown",
        });
      }
    });

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === query;
      const bExact = b.name.toLowerCase() === query;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    });

    setSearchResults(sortedResults);
    setIsSearchOpen(true);
  }, [searchQuery, restaurants, menuItems, popularItems, featuredItems]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchOpen || searchResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            handleResultClick(searchResults[selectedIndex]);
          }
          break;
        case "Escape":
          setIsSearchOpen(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, searchResults, selectedIndex]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchToggle = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleResultClick = (result: ISearchResult) => {
    // Immediately close all search UI
    setIsSearchOpen(false);
    setSearchQuery("");
    setSelectedIndex(-1);
    setIsSearchVisible(false);

    switch (result.type) {
      case "restaurant":
        // Use encoded name for slug route to match page query by name
        router.push(`/restaurant/${encodeURIComponent(result.slug as string)}`);
        break;
      case "menu":
      case "popular":
      case "featured":
        router.push(`/menu`); 
        break;
    }
  };

  const handleAddToCart = async (result: ISearchResult) => {
    if (result.type === "restaurant") return;
    if (!userId) {
      // Close search before redirect
      setIsSearchOpen(false);
      setSearchQuery("");
      setSelectedIndex(-1);
      setIsSearchVisible(false);
      router.push("/login");
      return;
    }
    // Close search UI first to avoid any overlay issues
    setIsSearchOpen(false);
    setSearchQuery("");
    setSelectedIndex(-1);
    setIsSearchVisible(false);
    setIsAddingToCart(result.id);

    // Prepare cart item with better fallbacks
    const cartItem = {
      userId: user.userId,
      itemId: result.id,
      restaurantId: result.restaurantId || result.restaurantName || "unknown",
      category: result.category || "general",
      image: result.image || "",
      name: result.name,
      price: result.price || "0",
      source: result.type as "menu" | "featured" | "popular",
      quantity: 1,
    };

    // Set item and open modal after a micro-task to ensure search closes first
    setItem(cartItem);
    requestAnimationFrame(() => {
      setIsOpen(true);
      setIsAddingToCart(null); // Reset loading
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "restaurant":
        return <Utensils className="w-4 h-4" />;
      case "menu":
        return <Star className="w-4 h-4" />;
      case "popular":
        return <Star className="w-4 h-4" />;
      case "featured":
        return <Star className="w-4 h-4" />;
      default:
        return <Utensils className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "restaurant":
        return "Restaurant";
      case "menu":
        return "Menu Item";
      case "popular":
        return "Popular";
      case "featured":
        return "Featured";
      default:
        return "Item";
    }
  };

  const getImageUrl = (result: ISearchResult) => {
    if (!result.image) return "/fallback-food.webp";

    try {
      switch (result.type) {
        case "restaurant":
          return fileUrl(validateEnv().restaurantBucketId, result.image);
        case "menu":
          return fileUrl(validateEnv().menuBucketId, result.image);
        case "popular":
          return fileUrl(validateEnv().popularBucketId, result.image);
        case "featured":
          return fileUrl(validateEnv().featuredBucketId, result.image);
        default:
          return "/fallback-food.webp";
      }
    } catch (error) {
      return "/fallback-food.webp";
    }
  };

  // Logout handler (shared for mobile and profile)
  const handleLogout = async () => {
    await dispatch(logoutAsync()).unwrap();
    dispatch(resetOrders());
    if (user?.userId && user.userId.startsWith("guest")) {
      if (orders) {
        const guestOrders = orders.filter(
          (order) => order.userId === user.userId
        );
        await Promise.all(
          guestOrders.map((order) =>
            dispatch(deleteOrderAsync(order.$id))
          )
        );
      }
    }
    toast.success("Logged out successfully!");
    router.push("/");
  };

  if (!isClient) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Logo />
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Sun className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Globe className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <UserCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg"
      } border-b border-gray-200 dark:border-gray-700`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Logo />
          <DesktopNav pathname={pathname} t={t} user={user} role={role} />
          <DesktopSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            isSearchOpen={isSearchOpen}
            selectedIndex={selectedIndex}
            isAddingToCart={isAddingToCart}
            inputRef={inputRef}
            searchRef={searchRef}
            handleSearchToggle={handleSearchToggle}
            isSearchVisible={isSearchVisible}
            handleResultClick={handleResultClick}
            handleAddToCart={handleAddToCart}
            getImageUrl={getImageUrl}
            getTypeLabel={getTypeLabel}
            getTypeIcon={getTypeIcon}
          />
          <RightActions
            theme={theme}
            setTheme={setTheme}
            currentLanguage={currentLanguage}
            changeLanguage={changeLanguage}
            isLanguageLoading={isLanguageLoading}
            isAuthenticated={isAuthenticated}
            user={user}
          />
          <MobileNav
            pathname={pathname}
            t={t}
            theme={theme}
            setTheme={setTheme}
            currentLanguage={currentLanguage}
            changeLanguage={changeLanguage}
            isLanguageLoading={isLanguageLoading}
            isAuthenticated={isAuthenticated}
            user={user}
            role={role}
            router={router}
            handleLogout={handleLogout}
          />
        </div>
        <MobileSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearchOpen={isSearchOpen}
          selectedIndex={selectedIndex}
          isAddingToCart={isAddingToCart}
          isSearchVisible={isSearchVisible}
          inputRef={inputRef}
          searchRef={searchRef}
          handleSearchToggle={handleSearchToggle}
          handleResultClick={handleResultClick}
          handleAddToCart={handleAddToCart}
          getImageUrl={getImageUrl}
          getTypeLabel={getTypeLabel}
          getTypeIcon={getTypeIcon}
        />
      </div>
    </header>
  );
};

export default Header;