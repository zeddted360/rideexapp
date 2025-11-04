"use client";
import React, { ChangeEvent, useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  PlusCircle,
  Star,
  Info,
  Upload,
  X,
  DollarSign,
  Sparkles,
  Plus,
  Pause,
} from "lucide-react";
import FileInput from "@/components/FileInput";
import { FeaturedItemFormData } from "@/utils/schema";
import { IRestaurantFetched, IFetchedExtras } from "../../../types/types";
import AddExtrasModal from "../vendor/AddExtrasModal";
import toast from "react-hot-toast";

interface FeaturedItemFormProps {
  form: UseFormReturn<FeaturedItemFormData>;
  restaurants: IRestaurantFetched[];
  onSubmit: (data: FeaturedItemFormData) => void;
  loading: boolean;
  onAddExtras: (selectedExtras: IFetchedExtras[]) => void;
}

const FeaturedItemForm = ({
  form,
  restaurants,
  onSubmit,
  loading,
  onAddExtras,
}: FeaturedItemFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<IRestaurantFetched | null>(null);
  const restaurantId = form.watch("restaurantId");

  // Update selected restaurant when restaurantId changes
  useEffect(() => {
    if (restaurantId) {
      const found = restaurants.find((r) => r.$id === restaurantId);
      setSelectedRestaurant(found || null);
    } else {
      setSelectedRestaurant(null);
    }
  }, [restaurantId, restaurants]);

  // Check if selected restaurant is paused
  const isPaused = selectedRestaurant?.isPaused || false;

  // Show warning toast if paused restaurant is selected
  useEffect(() => {
    if (isPaused && restaurantId) {
      toast.error(
        "Your restaurant is currently paused and cannot accept new featured items. Please contact support to resume operations and get back online."
      );
      // Optionally auto-clear selection
      // form.setValue("restaurantId", "");
      // setSelectedRestaurant(null);
    }
  }, [isPaused, restaurantId, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    form.setValue("image", undefined as any);
  };

  const getFieldError = (fieldName: keyof FeaturedItemFormData) => {
    return form.formState.errors[fieldName];
  };

  const isFieldTouched = (fieldName: keyof FeaturedItemFormData) => {
    return form.formState.touchedFields[fieldName];
  };

  // Handle submit with pause check
  const handleFormSubmit = (data: FeaturedItemFormData) => {
    if (isPaused) {
      toast.error(
        "Your restaurant is currently paused and cannot accept new featured items. Please contact support to resume operations and get back online."
      );
      return;
    }
    onSubmit(data);
  };

  // Disable entire form if paused
  if (isPaused && restaurantId) {
    return (
      <Card className="w-full bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-2xl border-0 py-4">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <span className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 p-2 rounded-full">
            <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
          </span>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Add Featured Item
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showcase your best dishes to attract more customers
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert variant="destructive" className="mb-6">
            <Pause className="h-4 w-4" />
            <AlertTitle>Restaurant Paused</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Your restaurant <strong>{selectedRestaurant?.name}</strong> is
                currently paused.
              </p>
              <p>
                You cannot add new featured items while paused. Please contact
                support to resume operations and get back online.
              </p>
            </AlertDescription>
          </Alert>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Form disabled until restaurant is resumed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-2xl border-0 py-4">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <span className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 p-2 rounded-full">
          <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
        </span>
        <div className="flex-1">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Add Featured Item
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showcase your best dishes to attract more customers
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
          aria-busy={loading}
        >
          {/* Item Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Item Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="md:col-span-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  Item Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g. Suya Platter"
                  className={`h-12 mt-1.5 transition-all ${
                    getFieldError("name")
                      ? "border-red-500 focus:ring-red-500"
                      : isFieldTouched("name")
                      ? "border-green-500 focus:ring-green-500"
                      : "focus:ring-orange-500"
                  }`}
                  disabled={loading}
                />
                {getFieldError("name") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("name")?.message as string}
                  </p>
                )}
              </div>

              {/* Category Field */}
              <div>
                <Label htmlFor="category" className="flex items-center gap-1">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  {...form.register("category")}
                  className={`h-12 w-full rounded-md border mt-1.5 transition-all ${
                    getFieldError("category")
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                  disabled={loading}
                >
                  <option value="">Select Category</option>
                  <option value="veg">🥗 Vegetarian</option>
                  <option value="non-veg">🍖 Non-Vegetarian</option>
                </select>
                {getFieldError("category") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("category")?.message as string}
                  </p>
                )}
              </div>

              {/* Restaurant Field */}
              <div>
                <Label
                  htmlFor="restaurantId"
                  className="flex items-center gap-1"
                >
                  Restaurant <span className="text-red-500">*</span>
                </Label>
                <select
                  id="restaurantId"
                  {...form.register("restaurantId")}
                  className={`h-12 w-full rounded-md border mt-1.5 transition-all ${
                    getFieldError("restaurantId")
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                  disabled={loading}
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.length === 0 ? (
                    <option disabled>No restaurants available</option>
                  ) : (
                    restaurants.map((r) => (
                      <option key={r.$id} value={r.$id} disabled={r.isPaused}>
                        {r.name} {r.isPaused && "(Paused)"}
                      </option>
                    ))
                  )}
                </select>
                {getFieldError("restaurantId") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("restaurantId")?.message as string}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="md:col-span-2">
                <Label
                  htmlFor="description"
                  className="flex items-center gap-1"
                >
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Highlight what makes this item special and worth featuring..."
                  className={`min-h-[100px] mt-1.5 transition-all ${
                    getFieldError("description")
                      ? "border-red-500 focus:ring-red-500"
                      : isFieldTouched("description")
                      ? "border-green-500 focus:ring-green-500"
                      : "focus:ring-orange-500"
                  }`}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Make it compelling! This will be prominently displayed to
                  customers
                </p>
                {getFieldError("description") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("description")?.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Rating Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Pricing & Rating
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Field */}
              <div>
                <Label htmlFor="price" className="flex items-center gap-1">
                  Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₦
                  </span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register("price")}
                    placeholder="4000"
                    className={`h-12 pl-8 transition-all ${
                      getFieldError("price")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("price")
                        ? "border-green-500 focus:ring-green-500"
                        : "focus:ring-orange-500"
                    }`}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Featured item price
                </p>
                {getFieldError("price") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("price")?.message as string}
                  </p>
                )}
              </div>

              {/* Rating Field */}
              <div>
                <Label htmlFor="rating" className="flex items-center gap-1">
                  Rating <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    {...form.register("rating", { valueAsNumber: true })}
                    placeholder="4.7"
                    className={`h-12 transition-all ${
                      getFieldError("rating")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("rating")
                        ? "border-green-500 focus:ring-green-500"
                        : "focus:ring-orange-500"
                    }`}
                    disabled={loading}
                  />
                  <Star className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Customer rating (0 to 5 stars)
                </p>
                {getFieldError("rating") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("rating")?.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Extras Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Add Extras
              </h3>
            </div>
            <div>
              <AddExtrasModal onAddExtras={onAddExtras} loading={loading} />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Featured Image
              </h3>
            </div>

            <div>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-800 dark:text-orange-300">
                    <strong>Pro tip:</strong> Use high-quality, appetizing
                    images for featured items. These get prime placement and
                    should showcase your best presentation!
                  </p>
                </div>
              </div>

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-56 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-lg"
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <FileInput
                    field={{
                      ...form.register("image"),
                      onChange: (e: ChangeEvent<HTMLInputElement>) => {
                        form.register("image").onChange(e);
                        handleImageChange(e);
                      },
                    }}
                    label="Upload Image"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Recommended: High-resolution JPG or PNG, max 5MB, landscape
                    or square format
                  </p>
                </div>
              )}
              {getFieldError("image") && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {getFieldError("image")?.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setImagePreview(null);
              }}
              disabled={loading}
              className="sm:w-auto"
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              className="flex items-center justify-center gap-2 px-8 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 sm:w-auto"
              disabled={loading || isPaused}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Add Featured Item
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeaturedItemForm;
