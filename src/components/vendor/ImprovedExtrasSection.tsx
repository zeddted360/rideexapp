'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, X, ChevronDown, ChevronUp, AlertCircle, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IFetchedExtras } from '../../../types/types';

interface ImprovedExtrasSectionProps {
  allExtras: IFetchedExtras[];
  extrasLoading: 'idle' | 'pending' | 'succeeded' | 'failed';
  selectedExtras: Set<string>;
  setSelectedExtras: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export default function ImprovedExtrasSection({
  allExtras,
  extrasLoading,
  selectedExtras,
  setSelectedExtras,
}: ImprovedExtrasSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExtraToggle = (extraId: string) => {
    const newSelected = new Set(selectedExtras);
    if (newSelected.has(extraId)) {
      newSelected.delete(extraId);
    } else {
      newSelected.add(extraId);
    }
    setSelectedExtras(newSelected);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const clearAllSelections = () => {
    setSelectedExtras(new Set());
  };

  const selectAll = () => {
    setSelectedExtras(new Set(filteredAndSortedExtras.map(e => e.$id)));
  };

  // Filter and sort extras
  const filteredAndSortedExtras = useMemo(() => {
    let filtered = allExtras.filter(
      (extra) =>
        extra.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (extra.description && extra.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Sort
   filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return Number(a.price ?? 0) - Number(b.price ?? 0);
        case 'price-desc':
          return Number(b.price ?? 0) - Number(a.price ?? 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [allExtras, searchQuery, sortBy]);

  // Calculate total price of selected extras
  const totalExtrasPrice = useMemo(() => {
    return Array.from(selectedExtras).reduce((sum, id) => {
      const extra = allExtras.find((e) => e.$id === id);
      return sum + +(extra?.price || 0);
    }, 0);
  }, [selectedExtras, allExtras]);

  const selectedCount = selectedExtras.size;
  const hasExtras = allExtras.length > 0;
  const showSearchBar = allExtras.length > 3;
  const allFilteredSelected = filteredAndSortedExtras.length > 0 && 
    filteredAndSortedExtras.every(extra => selectedExtras.has(extra.$id));

  return (
    <div className="space-y-3">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          Extras (Optional)
          {selectedCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full"
            >
              {selectedCount}
            </motion.span>
          )}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse extras section' : 'Expand extras section'}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="w-4 h-4 text-gray-500" />
          </motion.div>
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              {/* Search and filter bar */}
              {hasExtras && showSearchBar && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search extras..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-9 h-10 rounded-xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-shadow"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.preventDefault();
                        if (e.key === 'Escape') clearSearch();
                      }}
                      aria-label="Search extras"
                    />
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          type="button"
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          aria-label="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sort button */}
                  {allExtras.length > 1 && (
                    <div className="relative" ref={sortMenuRef}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="h-10 px-3 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Sort options"
                      >
                        <Filter className="w-4 h-4" />
                      </Button>

                      <AnimatePresence>
                        {showSortMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden"
                          >
                            <div className="py-1">
                              {[
                                { value: 'name' as const, label: 'Name (A-Z)' },
                                { value: 'price-asc' as const, label: 'Price (Low to High)' },
                                { value: 'price-desc' as const, label: 'Price (High to Low)' },
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setSortBy(option.value);
                                    setShowSortMenu(false);
                                  }}
                                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                    sortBy === option.value
                                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {/* Selected extras summary */}
              <AnimatePresence>
                {selectedCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedCount} extra{selectedCount !== 1 ? 's' : ''} selected
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          Additional cost: ₦{totalExtrasPrice.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAllSelections}
                        className="h-8 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                      >
                        Clear all
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bulk actions */}
              {filteredAndSortedExtras.length > 1 && !searchQuery && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={allFilteredSelected ? clearAllSelections : selectAll}
                    className="h-7 text-xs text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {allFilteredSelected ? 'Deselect all' : 'Select all'}
                  </Button>
                </div>
              )}

              {/* Extras list */}
              {extrasLoading === 'pending' ? (
                <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading extras...</p>
                  </div>
                </div>
              ) : filteredAndSortedExtras.length > 0 ? (
                <div className="space-y-2">
                  <div className="max-h-80 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <AnimatePresence mode="popLayout">
                      {filteredAndSortedExtras.map((extra: IFetchedExtras, index: number) => {
                        const isSelected = selectedExtras.has(extra.$id);
                        return (
                          <motion.div
                            key={extra.$id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ 
                              delay: index * 0.02,
                              layout: { duration: 0.2 }
                            }}
                            className={`
                              group relative flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer
                              ${isSelected
                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 shadow-sm'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-sm'
                              }
                            `}
                            onClick={() => handleExtraToggle(extra.$id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleExtraToggle(extra.$id);
                              }
                            }}
                            aria-pressed={isSelected}
                          >
                            <Checkbox
                              id={`extra-${extra.$id}`}
                              checked={isSelected}
                              onCheckedChange={() => handleExtraToggle(extra.$id)}
                              className="pointer-events-none"
                              aria-label={`Select ${extra.name}`}
                            />
                            <Label
                              htmlFor={`extra-${extra.$id}`}
                              className="flex-1 cursor-pointer space-y-1 pointer-events-none"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span
                                  className={`font-medium text-sm transition-colors ${
                                    isSelected 
                                      ? 'text-orange-900 dark:text-orange-100' 
                                      : 'text-gray-900 dark:text-white group-hover:text-orange-900 dark:group-hover:text-orange-100'
                                  }`}
                                >
                                  {extra.name}
                                </span>
                                <span
                                  className={`text-sm font-semibold whitespace-nowrap transition-colors ${
                                    isSelected 
                                      ? 'text-orange-600 dark:text-orange-400' 
                                      : 'text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                                  }`}
                                >
                                  +₦{extra.price.toLocaleString()}
                                </span>
                              </div>
                              {extra.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 pr-1">
                                  {extra.description}
                                </p>
                              )}
                            </Label>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Results info */}
                  {searchQuery && filteredAndSortedExtras.length < allExtras.length && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1"
                    >
                      Showing {filteredAndSortedExtras.length} of {allExtras.length} extras
                    </motion.p>
                  )}
                </div>
              ) : searchQuery ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400"
                >
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">No extras match "{searchQuery}"</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="mt-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  >
                    Clear search
                  </Button>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-20 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400">
                  <div className="text-center space-y-1">
                    <AlertCircle className="w-5 h-5 mx-auto opacity-50" />
                    <p className="text-sm">No extras available</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}