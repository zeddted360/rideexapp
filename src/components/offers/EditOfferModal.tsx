'use client';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';
import { motion, AnimatePresence } from 'framer-motion';
import { IPromoOfferFetched, IFetchedExtras } from '../../../types/types';
import { Button } from '@/components/ui/button';
import { X, Package, DollarSign, FileText, Tag, Upload, Loader2, Plus } from 'lucide-react';
import Image from 'next/image';
import { fileUrl, validateEnv } from '@/utils/appwrite';
import { addExtraToOffer, removeExtraFromOffer, updateAsyncOfferItem } from '@/state/offerSlice';
import { fetchExtraById, listAllAsyncExtras } from '@/state/extraSlice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import toast from 'react-hot-toast';

interface EditOfferModalProps {
  offer: IPromoOfferFetched | null;
  isOpen: boolean;
  onClose: () => void;
}

function EditOfferModal({ offer: propOffer, isOpen, onClose }: EditOfferModalProps) {
  // Early return before any hooks
  if (!isOpen || !propOffer) return null;

  const dispatch = useDispatch<AppDispatch>();
  const { allExtras, loading: extrasLoading } = useSelector((state: RootState) => state.extra);
  const offer = useMemo(() => propOffer, [propOffer]);
  const [editedOffer, setEditedOffer] = useState<IPromoOfferFetched>(offer);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    offer.image
      ? fileUrl(validateEnv().promoOfferBucketId, offer.image)
      : 'https://placehold.co/600x400/FF6B35/FFFFFF?text=No+Image&font=roboto'
  );
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>(offer.extras || []);
  const [showAddExtraDropdown, setShowAddExtraDropdown] = useState<boolean>(false);
  const [searchExtra, setSearchExtra] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fetchedCurrentExtras, setFetchedCurrentExtras] = useState<IFetchedExtras[]>([]);
  const [currentExtrasLoading, setCurrentExtrasLoading] = useState<boolean>(false);

  // Fetch all available extras on modal open
  useEffect(() => {
    dispatch(listAllAsyncExtras());
  }, [dispatch, isOpen]);

  // Fetch details for current extras when selectedExtraIds changes
  useEffect(() => {
    if (selectedExtraIds.length > 0) {
      setCurrentExtrasLoading(true);
      const fetchPromises = selectedExtraIds.map((extraId: string) =>
        dispatch(fetchExtraById(extraId))
          .unwrap()
          .catch((err: unknown) => {
            console.warn(`Failed to fetch current extra ${extraId}:`, err);
            return null;
          })
      );
      Promise.all(fetchPromises).then((results) => {
        const validExtras = results.filter((extra): extra is IFetchedExtras => extra !== null);
        setFetchedCurrentExtras(validExtras);
        setCurrentExtrasLoading(false);
      });
    } else {
      setFetchedCurrentExtras([]);
      setCurrentExtrasLoading(false);
    }
  }, [selectedExtraIds, dispatch]);

  // Filter available extras based on search
  const memoIsedExtra = useMemo(() => allExtras, [allExtras, selectedExtraIds, searchExtra]);

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return Number.isFinite(numPrice) ? `₦${numPrice.toLocaleString()}` : '₦0';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setNewImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleAddExtra = async (extraId: string) => {
    try {
      await dispatch(addExtraToOffer({ itemId: offer.$id, extraId })).unwrap();
      setSelectedExtraIds((prev) => {
        if (!prev.includes(extraId)) {
          return [...prev, extraId];
        }
        return prev;
      });
      setSearchExtra('');
      setShowAddExtraDropdown(false);
    } catch (error) {
      console.error('Failed to add extra:', error);
      toast.error('Failed to add extra to offer');
    }
  };

  const handleRemoveExtra = async (extraId: string) => {
    try {
      await dispatch(removeExtraFromOffer({ itemId: offer.$id, extraId })).unwrap();
      setSelectedExtraIds((prev) => prev.filter((id) => id !== extraId));
      setFetchedCurrentExtras((prev) => prev.filter((extra) => extra.$id !== extraId));
    } catch (error) {
      console.error('Failed to remove extra:', error);
      toast.error('Failed to remove extra');
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const finalOffer = {
      ...editedOffer,
      extras: selectedExtraIds,
    };

    try {
      await dispatch(
        updateAsyncOfferItem({
          itemId: offer.$id,
          data: finalOffer,
          newImage,
        })
      ).unwrap();
      toast.success('Offer updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update offer');
    } finally {
      if (newImage && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setIsSaving(false);
      onClose();
    }
  };

  const handleCancel = () => {
    setEditedOffer(offer);
    setSelectedExtraIds(offer.extras || []);
    if (newImage && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setNewImage(null);
    setImagePreview(
      offer.image
        ? fileUrl(validateEnv().promoOfferBucketId, offer.image)
        : 'https://placehold.co/600x400/FF6B35/FFFFFF?text=No+Image&font=roboto'
    );
    setSearchExtra('');
    setShowAddExtraDropdown(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Edit Offer</h3>
                    <p className="text-orange-100 text-sm">Update offer details</p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  disabled={isSaving}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Image Preview */}
                <div className="space-y-4">
                  <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <Image
                      src={imagePreview}
                      alt={editedOffer.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                        className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        Change Image
                      </button>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSaving}
                    className="hidden"
                  />
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                    <p className="text-xs text-orange-700 dark:text-orange-400 flex items-center gap-2">
                      <Upload className="w-3 h-3" />
                      Click on image to update offer photo
                    </p>
                  </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="space-y-4">
                  {/* Offer Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Package className="w-4 h-4 text-orange-500" />
                      Offer Name
                    </label>
                    <input
                      type="text"
                      value={editedOffer.name}
                      onChange={(e) => setEditedOffer({ ...editedOffer, name: e.target.value })}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
                      placeholder="Enter offer name"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      Description
                    </label>
                    <textarea
                      value={editedOffer.description}
                      onChange={(e) => setEditedOffer({ ...editedOffer, description: e.target.value })}
                      disabled={isSaving}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none disabled:opacity-50"
                      placeholder="Enter offer description"
                      rows={3}
                    />
                  </div>

                  {/* Pricing Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Original Price */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        Original Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₦</span>
                        <input
                          type="number"
                          value={editedOffer.originalPrice}
                          onChange={(e) =>
                            setEditedOffer({ ...editedOffer, originalPrice: Number(e.target.value) })
                          }
                          disabled={isSaving}
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Offer Price */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <DollarSign className="w-4 h-4 text-orange-500" />
                        Offer Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">₦</span>
                        <input
                          type="number"
                          value={editedOffer.discountedPrice}
                          onChange={(e) =>
                            setEditedOffer({ ...editedOffer, discountedPrice: Number(e.target.value) })
                          }
                          disabled={isSaving}
                          className="w-full pl-8 pr-4 py-2.5 border border-orange-300 dark:border-orange-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Savings Preview */}
                  {editedOffer.originalPrice > editedOffer.discountedPrice && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-sm text-green-700 dark:text-green-400">
                        <span className="font-semibold">Savings:</span>{' '}
                        {formatPrice(editedOffer.originalPrice - editedOffer.discountedPrice)} (
                        {Math.round(
                          ((editedOffer.originalPrice - editedOffer.discountedPrice) /
                            editedOffer.originalPrice) *
                            100
                        )}
                        % off)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add-ons Section - Current Selected */}
              {selectedExtraIds.length > 0 && (
                <div className="mt-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Tag className="w-4 h-4 text-orange-500" />
                    Current Add-ons
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentExtrasLoading ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="w-4 h-4 animate-spin mr-2 text-orange-600" />
                        <span className="text-xs text-gray-500">Loading...</span>
                      </div>
                    ) : fetchedCurrentExtras.length > 0 ? (
                      fetchedCurrentExtras.map((extra) => (
                        <motion.span
                          key={extra.$id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-800 flex items-center gap-1 shadow-sm"
                        >
                          {extra.name}
                          <span className="text-amber-600 dark:text-amber-300 font-semibold text-[10px]">
                            +{formatPrice(extra.price)}
                          </span>
                          <button
                            onClick={() => handleRemoveExtra(extra.$id)}
                            className="ml-1 p-0.5 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
                            disabled={isSaving}
                          >
                            <X className="w-3 h-3 text-amber-500" />
                          </button>
                        </motion.span>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">No details available</p>
                    )}
                  </div>
                </div>
              )}

              {/* Add New Add-on Dropdown */}
              <div className="mt-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Plus className="w-4 h-4 text-orange-500" />
                  Add New Extra
                </label>
                <div className="relative">
                  <Select
                    open={showAddExtraDropdown}
                    onOpenChange={setShowAddExtraDropdown}
                    onValueChange={handleAddExtra}
                    disabled={isSaving || extrasLoading === 'pending'}
                  >
                    <SelectTrigger className="w-full h-10 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500">
                      <SelectValue placeholder="Search and select add-on..." />
                    </SelectTrigger>
                    <SelectContent className="w-full max-h-48 overflow-y-auto">
                      <div className="p-2">
                        <Input
                          placeholder="Search add-ons..."
                          value={searchExtra}
                          onChange={(e) => setSearchExtra(e.target.value)}
                          className="h-8 mb-2 border-gray-300 dark:border-gray-600"
                          disabled={isSaving || extrasLoading === 'pending'}
                        />
                      </div>
                      {memoIsedExtra.length > 0 ? (
                        memoIsedExtra.map((extra) => (
                          <SelectItem
                            key={extra.$id}
                            value={extra.$id}
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <span className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="font-medium">{extra.name}</span>
                                {extra.description && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {extra.description}
                                  </span>
                                )}
                              </div>
                            </span>
                            <span className="text-sm font-semibold text-orange-600">
                              {formatPrice(extra.price)}
                            </span>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="Nill" disabled className="text-center text-gray-500 dark:text-gray-400">
                          No add-ons found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !editedOffer.name || editedOffer.discountedPrice >= editedOffer.originalPrice}
                  className="px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default EditOfferModal;