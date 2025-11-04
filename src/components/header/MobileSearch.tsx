// components/Header/MobileSearch.tsx
import React,{JSX} from "react";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { ISearchResult } from "../../../types/types";
import MobileSearchBar from "../ui/MobileSearchBar";

interface MobileSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: ISearchResult[];
  isSearchOpen: boolean;
  selectedIndex: number;
  isAddingToCart: string | null;
  isSearchVisible: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  searchRef: React.RefObject<HTMLDivElement | null>;
  handleSearchToggle: () => void;
  handleResultClick: (result: ISearchResult) => void;
  handleAddToCart: (result: ISearchResult) => Promise<void>;
  getImageUrl: (result: ISearchResult) => string;
  getTypeLabel: (type: string) => "Restaurant" | "Menu Item" | "Popular" | "Featured" | "Item";
  getTypeIcon: (type: string) => JSX.Element;
}

const MobileSearch: React.FC<MobileSearchProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearchOpen,
  selectedIndex,
  isAddingToCart,
  isSearchVisible,
  inputRef,
  searchRef,
  handleSearchToggle,
  handleResultClick,
  handleAddToCart,
  getImageUrl,
  getTypeLabel,
  getTypeIcon,
}) => {
  return (
    <div className="lg:hidden mb-4 relative" ref={searchRef}>
      <div className="relative">
        {!isSearchVisible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchToggle}
            className="w-full justify-start rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 shadow-lg"
          >
            <Search className="w-5 h-5 mr-3 text-orange-500 dark:text-orange-400" />
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              Search restaurants, menu items...
            </span>
          </Button>
        )}

        {isSearchVisible && (
          <div className="relative z-40"> {/* Increased z-index for consistency */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl blur-sm" />
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-orange-200/50 dark:border-orange-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center px-4 py-3">
                <Search className="w-5 h-5 mr-3 text-orange-500 dark:text-orange-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search restaurants, menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) {
                      // Note: isSearchOpen managed in parent
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 font-medium"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      // Note: isSearchOpen managed in parent
                      inputRef.current?.focus();
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    handleSearchToggle();
                    setSearchQuery("");
                    // Note: isSearchOpen managed in parent
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isSearchVisible && isSearchOpen && searchResults.length > 0 && (
        <MobileSearchBar
          searchResults={searchResults}
          selectedIndex={selectedIndex}
          isAddingToCart={isAddingToCart}
          getImageUrl={getImageUrl}
          getTypeLabel={getTypeLabel}
          getTypeIcon={getTypeIcon}
          handleResultClick={handleResultClick}
          handleAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default MobileSearch;