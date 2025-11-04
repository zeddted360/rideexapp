'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import toast from 'react-hot-toast';
import { Plus, Loader2, X, Upload, DollarSign, Tag, Utensils, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createAsyncOfferItem } from '@/state/offerSlice';
import { listAsyncRestaurants } from '@/state/restaurantSlice';
import { listAllAsyncExtras } from '@/state/extraSlice';
import { IRestaurantFetched, IFetchedExtras } from '../../types/types';
import ImprovedExtrasSection from './vendor/ImprovedExtrasSection';

interface AddPromoOfferFormProps {
  onSuccess: () => void;
}

interface IOfferFormData {
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  category: 'veg' | 'non-veg';
  restaurantId: string;
  selectedExtras: string[]; // Store $id of selected extras
}

export default function AddPromoOfferForm({ onSuccess }: AddPromoOfferFormProps) {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<IOfferFormData>({
    name: '',
    description: '',
    originalPrice: 0,
    discountedPrice: 0,
    category: 'veg',
    restaurantId: '',
    selectedExtras: [],
  });
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const { restaurants } = useSelector((state: RootState) => state.restaurant);
  const { allExtras, loading: extrasLoading } = useSelector((state: RootState) => state.extra);

  // Effect to list all restaurants on mount
  useEffect(() => {
    if (user) dispatch(listAsyncRestaurants());
  }, [user, dispatch]);

  // Fetch all extras (first 100) when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(listAllAsyncExtras());
      // Reset selected extras when modal opens
      setSelectedExtras(new Set());
      setFormData(prev => ({ ...prev, selectedExtras: [] }));
    }
  }, [isOpen, dispatch]);

  // Update formData.selectedExtras when selectedExtras changes
  useEffect(() => {
    const selectedIds = Array.from(selectedExtras);
    setFormData(prev => ({ ...prev, selectedExtras: selectedIds }));
  }, [selectedExtras]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('Price') ? parseFloat(value) || 0 : value,
    });
  };

  const handleCategoryChange = (value: 'veg' | 'non-veg') => {
    setFormData({ ...formData, category: value });
  };

  const handleRestaurantChange = (value: string) => {
    setFormData({ ...formData, restaurantId: value });
  };

  const handleExtraToggle = (extraId: string) => {
    const newSelected = new Set(selectedExtras);
    if (newSelected.has(extraId)) {
      newSelected.delete(extraId);
    } else {
      newSelected.add(extraId);
    }
    setSelectedExtras(newSelected);
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImageFiles(files);
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  const removeImage = () => {
    setImageFiles(null);
    setImagePreview(null);
  };

  const calculateDiscount = () => {
    if (formData.originalPrice > 0 && formData.discountedPrice > 0) {
      const discount = ((formData.originalPrice - formData.discountedPrice) / formData.originalPrice) * 100;
      return discount.toFixed(1);
    }
    return '0';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId || user.role !== "admin") {
      toast.error('Unauthorized access');
      return;
    }

    if (formData.discountedPrice >= formData.originalPrice) {
      toast.error('Discounted price must be less than original price');
      return;
    }

    if (!imageFiles || imageFiles.length === 0) {
      toast.error('Offer image is required');
      return;
    }

    // Stringify the array of extra $ids for the payload
    const payloadExtras = formData.selectedExtras.map(extra=>extra);
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        originalPrice: formData.originalPrice,
        discountedPrice: formData.discountedPrice,
        category: formData.category,
        restaurantId: formData.restaurantId,
        extras: payloadExtras, 
        image: imageFiles,
      };
      await dispatch(createAsyncOfferItem(payload)).unwrap();

      // Reset form
      setFormData({
        name: '',
        description: '',
        originalPrice: 0,
        discountedPrice: 0,
        category: 'veg',
        restaurantId: '',
        selectedExtras: [],
      });
      setSelectedExtras(new Set());
      setImageFiles(null);
      setImagePreview(null);
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      console.error('Failed to create promo offer:', err);
      // Error toast is handled in the thunk
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Get names of selected extras for display
  const getSelectedExtraNames = () => {
    return formData.selectedExtras
      .map(id => allExtras.find(extra => extra.$id === id)?.name || '')
      .filter(name => name !== '')
      .join(', ');
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-full px-6 py-6"
        size="lg"
      >
        <Plus className="w-5 h-5" />
        <span className="font-semibold">Add Offer</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Create Promo Offer</h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-9 w-9 rounded-full p-0 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Image Upload Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Offer Image</Label>
                  {imagePreview ? (
                    <div className="relative group">
                      <div className="relative h-48 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            onClick={removeImage}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex flex-col items-center gap-2 text-center p-4">
                        <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 p-4 rounded-full">
                          <Upload className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload image</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFilesChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Offer Name */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Offer Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Weekend Special Combo"
                      className="h-11 rounded-xl border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-500"
                    />
                  </div>

                  {/* Restaurant Selection */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="restaurantId" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-orange-600" />
                      Restaurant
                    </Label>
                    <Select value={formData.restaurantId} onValueChange={handleRestaurantChange}>
                      <SelectTrigger className="h-11 rounded-xl border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select a restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants && restaurants.length > 0 ? (
                          restaurants.map((restaurant: IRestaurantFetched) => (
                            <SelectItem key={restaurant.$id} value={restaurant.$id}>
                              {restaurant.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-restaurants" disabled>
                            No restaurants available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleCategoryChange(value as 'veg' | 'non-veg')}>
                      <SelectTrigger className="h-11 rounded-xl border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">
                          <span className="flex items-center gap-2">
                            🥗 Vegetarian
                          </span>
                        </SelectItem>
                        <SelectItem value="non-veg">
                          <span className="flex items-center gap-2">
                            🍗 Non-Vegetarian
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Discount Badge */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Discount</Label>
                    <div className="h-11 flex items-center justify-center bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl border border-orange-200 dark:border-orange-800">
                      <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        {calculateDiscount()}% OFF
                      </span>
                    </div>
                  </div>

                  {/* Original Price */}
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      Original Price
                    </Label>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      required
                      placeholder="1000"
                      className="h-11 rounded-xl border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-500"
                    />
                  </div>

                  {/* Discounted Price */}
                  <div className="space-y-2">
                    <Label htmlFor="discountedPrice" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-orange-600" />
                      Discounted Price
                    </Label>
                    <Input
                      id="discountedPrice"
                      name="discountedPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discountedPrice}
                      onChange={handleInputChange}
                      required
                      placeholder="850"
                      className="h-11 rounded-xl border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe your amazing offer..."
                    rows={3}
                    className="rounded-xl border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-500 resize-none"
                  />
                </div>
                <ImprovedExtrasSection 
                      allExtras={allExtras}
                      extrasLoading={extrasLoading}
                      selectedExtras={selectedExtras}
                      setSelectedExtras={setSelectedExtras}
                />
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Offer
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-8 h-12 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}