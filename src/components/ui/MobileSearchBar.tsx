import React, { JSX } from 'react'
import { Badge } from './badge';
import { MapPin, Plus } from 'lucide-react';
import { ISearchResult } from '../../../types/types';
import Image from 'next/image';

interface MobileSearchProps {
  searchResults: ISearchResult[];
  selectedIndex: number;
  isAddingToCart: string | null;
  getTypeLabel: (
    type: string
  ) => "Restaurant" | "Menu Item" | "Popular" | "Featured" | "Item";
  getTypeIcon: (type: string) => JSX.Element;
  getImageUrl: (result: ISearchResult) => string;
  handleResultClick: (result: ISearchResult) => void;
  handleAddToCart:(result:ISearchResult)=>Promise<void>;
}

const MobileSearchBar: React.FC<MobileSearchProps> = ({ searchResults,selectedIndex,getImageUrl,getTypeLabel,getTypeIcon,isAddingToCart,handleResultClick,handleAddToCart }) => {
  return (
    <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-h-96 overflow-y-auto z-30">
      <div className="p-3">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
          {searchResults.length} result
          {searchResults.length !== 1 ? "s" : ""} found
        </div>
        {searchResults.map((result, index) => (
          <div
            key={`${result.type}-${result.id}`}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
              index === selectedIndex
                ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700"
                : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
            }`}
          >
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(result);
                    }}
                    disabled={isAddingToCart === result.id}
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 flex items-center gap-1 font-medium shadow-sm"
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
        ))}
      </div>
    </div>
  );
};

export default MobileSearchBar