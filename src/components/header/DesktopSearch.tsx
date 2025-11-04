// components/Header/DesktopSearch.tsx
import React,{JSX} from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, MapPin, Clock, Plus } from "lucide-react";
import Image from "next/image";
import { ISearchResult } from "../../../types/types";

interface DesktopSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: ISearchResult[];
  isSearchOpen: boolean;
  selectedIndex: number;
  isAddingToCart: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  searchRef: React.RefObject<HTMLDivElement | null>;
  handleSearchToggle: () => void;
  isSearchVisible: boolean;
  handleResultClick: (result: ISearchResult) => void;
  handleAddToCart: (result: ISearchResult) => Promise<void>; // Made async for consistency
  getImageUrl: (result: ISearchResult) => string;
  getTypeLabel: (type: string) => string;
  getTypeIcon: (type: string) => JSX.Element;
}

const DesktopSearch: React.FC<DesktopSearchProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearchOpen,
  selectedIndex,
  isAddingToCart,
  inputRef,
  searchRef,
  handleSearchToggle,
  isSearchVisible,
  handleResultClick,
  handleAddToCart,
  getImageUrl,
  getTypeLabel,
  getTypeIcon,
}) => {
  return (
    <div
      className="hidden lg:block flex-1 max-w-md mx-8 relative"
      ref={searchRef}
    >
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSearchToggle}
          className={`group relative rounded-full transition-all duration-300 hover:scale-105 p-0 ${
            isSearchVisible
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
              : "bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20"
          }`}
        >
          <div
            className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
              isSearchVisible ? "bg-orange-500" : ""
            }`}
          >
            <Search
              className={`w-5 h-5 transition-all duration-300 ${
                isSearchVisible
                  ? "text-white transform scale-110"
                  : "text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300"
              }`}
            />
            {!isSearchVisible && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Search
              </div>
            )}
          </div>
          {!isSearchVisible && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </Button>

        {isSearchVisible && (
          <div className="absolute top-full left-0 right-0 mt-3 transition-all duration-300 ease-out z-40"> {/* Increased z-index */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl blur-sm" />
              <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-orange-200/50 dark:border-orange-700/50 rounded-2xl shadow-2xl w-[400px] mx-auto md:mr-10">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-500 dark:text-orange-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search restaurants, menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) {
                      // Note: isSearchOpen is managed in parent
                    }
                  }}
                  className="w-full pl-12 pr-12 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl focus:ring-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      // Note: isSearchOpen managed in parent
                      inputRef.current?.focus();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {isSearchOpen && searchResults.length > 0 && (
              <div className="w-[400px] mx-auto md:mr-10 top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-h-96 overflow-y-auto z-10 relative"> {/* Adjusted z-index relative to parent */}
                <div className="p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                    {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""} found
                  </div>
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className={`w-full p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                        index === selectedIndex
                          ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
                      }`}
                      onClick={() => handleResultClick(result)} // Added direct click for better UX
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700">
                          <Image
                            src={getImageUrl(result)}
                            alt={result.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {result.name}
                            </h4>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                            >
                              {getTypeLabel(result.type)}
                            </Badge>
                          </div>
                          {result.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {result.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            {result.price && (
                              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                ₦{result.price}
                              </span>
                            )}
                            {result.restaurantName && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {result.restaurantName}
                              </span>
                            )}
                            {result.deliveryTime && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {result.deliveryTime}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-gray-400 dark:text-gray-500">
                            {getTypeIcon(result.type)}
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleResultClick(result);
                              }}
                              className="px-3 py-1.5 text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 flex items-center gap-1 font-medium shadow-sm"
                            >
                              <MapPin className="w-3 h-3" />
                              View
                            </button>
                            {result.type !== "restaurant" && (
                              <button
                                onClick={async (e) => {
                                  console.log("the result clicked is :", result)
                                  e.preventDefault();
                                  e.stopPropagation();
                                  await handleAddToCart(result);
                                }}
                                disabled={isAddingToCart === result.id}
                                className="cursor-pointer px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 flex items-center gap-1 font-medium shadow-sm"
                              >
                                {isAddingToCart === result.id ? (
                                  <>
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    Add
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopSearch;