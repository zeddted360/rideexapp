"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  XCircle,
  CheckCircle,
  Image as ImageIcon,
  Edit2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { AppDispatch } from "@/state/store";
import { updateAsyncMenuItem } from "@/state/menuSlice";
import { updateAsyncPopularItem } from "@/state/popularSlice";
import { updateAsyncFeaturedItem } from "@/state/featuredSlice";
import { updateAsyncDiscount } from "@/state/discountSlice";
import { listAsyncMenusItem } from "@/state/menuSlice";
import { listAsyncPopularItems } from "@/state/popularSlice";
import { listAsyncFeaturedItems } from "@/state/featuredSlice";
import { listAsyncDiscounts } from "@/state/discountSlice";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  IFeaturedItemFetched,
  IMenuItemFetched,
  IPopularItemFetched,
  IDiscountFetched,
} from "../../../types/types";

type ContentType = "menu" | "popular" | "featured" | "discount";
type ContentItem =
  | IMenuItemFetched
  | IPopularItemFetched
  | IFeaturedItemFetched
  | IDiscountFetched;

interface EditItemModalProps {
  item: ContentItem;
  type: ContentType;
  dispatch: AppDispatch;
  onClose: () => void;
  editFormData: any;
  setEditFormData: React.Dispatch<React.SetStateAction<any>>;
  newImage: File | null;
  setNewImage: React.Dispatch<React.SetStateAction<File | null>>;
  isUpdating: boolean;
  setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>;
  restaurantName: string;
  setRestaurantName: React.Dispatch<React.SetStateAction<string>>;
}

export default function EditItemModal({
  item,
  type,
  dispatch,
  onClose,
  editFormData,
  setEditFormData,
  newImage,
  setNewImage,
  isUpdating,
  setIsUpdating,
  restaurantName,
  setRestaurantName,
}: EditItemModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [calculationWarning, setCalculationWarning] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (newImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(newImage);
    } else {
      setPreviewImage(null);
    }
  }, [newImage]);

  // Auto-calculation for discount discountedPrice
  useEffect(() => {
    if (
      type === "discount" &&
      editFormData.originalPrice &&
      editFormData.discountValue > 0
    ) {
      let calculated: number;
      let warning: string | null = null;
      if (editFormData.discountType === "percentage") {
        if (editFormData.discountValue > 100) {
          warning = "Percentage discount cannot exceed 100%.";
          calculated = editFormData.originalPrice;
        } else {
          calculated =
            Math.round(
              editFormData.originalPrice *
                (1 - editFormData.discountValue / 100) *
                100
            ) / 100;
        }
      } else {
        if (editFormData.discountValue > editFormData.originalPrice) {
          warning = "Fixed discount cannot exceed original price.";
          calculated = 0;
        } else {
          calculated =
            Math.round(
              (editFormData.originalPrice - editFormData.discountValue) * 100
            ) / 100;
        }
      }
      setEditFormData((prev: any) => ({
        ...prev,
        discountedPrice: calculated,
      }));
      setCalculationWarning(warning);
    } else if (type === "discount") {
      setEditFormData((prev: any) => ({
        ...prev,
        discountedPrice: editFormData.originalPrice || 0,
      }));
      setCalculationWarning(null);
    }
  }, [
    editFormData.originalPrice,
    editFormData.discountValue,
    editFormData.discountType,
    type,
    setEditFormData,
  ]);

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const value = e.target.value;
    if (type === "discount" && e.target.name === "discountValue") {
      const val = parseFloat(value) || 0;
      if (editFormData.discountType === "percentage" && val > 100) {
        // Optional: Show inline warning, but let schema handle on submit
      } else if (
        editFormData.discountType === "fixed" &&
        val > editFormData.originalPrice
      ) {
        // Optional: Show inline warning
      }
    }
    setEditFormData({ ...editFormData, [e.target.name]: value });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const hasChanges = () => {
    // Compare editFormData with item
    const keys = Object.keys(editFormData) as (keyof typeof editFormData)[];
    for (const key of keys) {
      // Skip non-relevant fields like $id, restaurantId, or isApproved if they are not editable
      if (key === "$id" || key === "restaurantId" || key === "isApproved")
        continue;

      // Convert values to strings for consistent comparison, handling numbers and undefined
      const formValue =
        editFormData[key] !== undefined ? String(editFormData[key]) : "";
      const itemValue =
        (item as any)[key] !== undefined ? String((item as any)[key]) : "";

      if (formValue !== itemValue) {
        return true;
      }
    }
    // Check if a new image is selected
    if (newImage !== null) {
      return true;
    }
    return false;
  };

  const handleUpdate = async () => {
    if (!hasChanges()) {
      toast.error(
        "No changes made to the item. Please update at least one field to proceed.",
        {
          style: {
            background: "#f97316", // Orange background
            color: "#ffffff", // White text
            border: "1px solid #ea580c",
          },
          iconTheme: {
            primary: "#ffffff", // White icon
            secondary: "#f97316", // Orange background for icon
          },
        }
      );
      return;
    }

    setIsUpdating(true);
    try {
      const itemId = item.$id;
      let updateData: any;
      let action;
      switch (type) {
        case "menu":
          updateData = {
            name: editFormData.name,
            description: editFormData.description,
            price: editFormData.price,
            originalPrice: editFormData.originalPrice || "0",
            cookTime: editFormData.cookTime,
            category: editFormData.category,
            restaurantId: editFormData.restaurantId,
            isApproved: editFormData.isApproved,
          };
          action = updateAsyncMenuItem({ itemId, data: updateData, newImage });
          break;
        case "featured":
          updateData = {
            name: editFormData.name,
            description: editFormData.description,
            price: editFormData.price,
            rating: editFormData.rating,
            category: editFormData.category,
            restaurantId: editFormData.restaurantId,
            isApproved: editFormData.isApproved,
          };
          action = updateAsyncFeaturedItem({
            itemId,
            data: updateData,
            newImage,
          });
          break;
        case "popular":
          updateData = {
            name: editFormData.name,
            description: editFormData.description,
            price: editFormData.price,
            originalPrice: editFormData.originalPrice || "0",
            rating: parseFloat(editFormData.rating),
            reviewCount: parseInt(
              editFormData.reviewCount?.toString() || "0",
              10
            ),
            category: editFormData.category,
            cookingTime: editFormData.cookingTime,
            isPopular: editFormData.isPopular,
            discount: editFormData.discount,
            restaurantId: editFormData.restaurantId,
            isApproved: editFormData.isApproved,
          };
          action = updateAsyncPopularItem({
            itemId,
            data: updateData,
            newImage,
          });
          break;
        case "discount":
          updateData = {
            title: editFormData.title,
            description: editFormData.description,
            discountType: editFormData.discountType,
            discountValue: parseFloat(editFormData.discountValue),
            originalPrice: parseFloat(editFormData.originalPrice),
            discountedPrice: parseFloat(editFormData.discountedPrice),
            validFrom: editFormData.validFrom,
            validTo: editFormData.validTo,
            minOrderValue: parseFloat(editFormData.minOrderValue || "0"),
            maxUses: parseInt(editFormData.maxUses || "0"),
            code: editFormData.code,
            appliesTo: editFormData.appliesTo,
            targetId: editFormData.targetId,
            isActive: editFormData.isActive,
          };
          action = updateAsyncDiscount({
            id: itemId,
            data: updateData,
            imageFile: newImage,
          });
          break;
      }

      if (action) {
        await dispatch(action as any).unwrap();
        toast.success("Item updated successfully", {
          style: {
            background: "#f97316",
            color: "#ffffff",
            border: "1px solid #ea580c",
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#f97316",
          },
        });
        onClose();
        // Refetch based on type
        switch (type) {
          case "menu":
            dispatch(listAsyncMenusItem());
            break;
          case "featured":
            dispatch(listAsyncFeaturedItems());
            break;
          case "popular":
            dispatch(listAsyncPopularItems());
            break;
          case "discount":
            dispatch(listAsyncDiscounts());
            break;
        }
      }
    } catch (error) {
      toast.error("Failed to update item", {
        style: {
          background: "#f97316",
          color: "#ffffff",
          border: "1px solid #ea580c",
        },
        iconTheme: {
          primary: "#ffffff",
          secondary: "#f97316",
        },
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-200 dark:border-orange-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-orange-100 dark:border-orange-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Edit2 className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Edit {type.charAt(0).toUpperCase() + type.slice(1)} Item
            </h3>
          </div>
          <Button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <form className="space-y-5">
          {type !== "discount" ? (
            <>
              {/* Basic Information Section for non-discount */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                  Basic Information
                </h4>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Name
                  </Label>
                  <Input
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    placeholder="Enter item name"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </Label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    placeholder="Enter item description"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </Label>
                    <select
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select category</option>
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>
                  {type !== "menu" && (
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rating
                      </Label>
                      <Input
                        name="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editFormData.rating}
                        onChange={handleEditChange}
                        placeholder="0.0"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                  Pricing
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (₦)
                    </Label>
                    <Input
                      name="price"
                      type="number"
                      value={editFormData.price}
                      onChange={handleEditChange}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  {"originalPrice" in editFormData &&
                    editFormData.originalPrice !== undefined && (
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Original Price (₦)
                        </Label>
                        <Input
                          name="originalPrice"
                          type="number"
                          value={editFormData.originalPrice}
                          onChange={handleEditChange}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    )}
                  {"discount" in editFormData &&
                    editFormData.discount !== undefined && (
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Discount
                        </Label>
                        <Input
                          name="discount"
                          value={editFormData.discount}
                          onChange={handleEditChange}
                          placeholder="e.g., 20% OFF"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    )}
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                  Additional Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {("cookTime" in editFormData ||
                    "cookingTime" in editFormData) && (
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cooking Time
                      </Label>
                      <Input
                        name={
                          "cookTime" in editFormData
                            ? "cookTime"
                            : "cookingTime"
                        }
                        value={
                          editFormData.cookTime ||
                          editFormData.cookingTime ||
                          ""
                        }
                        onChange={handleEditChange}
                        placeholder="e.g., 20-25 mins"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}
                  {"reviewCount" in editFormData &&
                    editFormData.reviewCount !== undefined && (
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Review Count
                        </Label>
                        <Input
                          name="reviewCount"
                          type="number"
                          min="0"
                          value={editFormData.reviewCount}
                          onChange={handleEditChange}
                          placeholder="0"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    )}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Restaurant
                    </Label>
                    <Input
                      name="restaurantId"
                      disabled
                      value={restaurantName || editFormData.restaurantId}
                      onChange={handleEditChange}
                      placeholder="Enter restaurant ID"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Basic Information Section for discount */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                  Basic Information
                </h4>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </Label>
                  <Input
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    placeholder="Enter discount title"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </Label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    placeholder="Enter discount description"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                  />
                </div>
              </div>
              {/* Discount Details Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                  Discount Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discount Type
                    </Label>
                    <select
                      name="discountType"
                      value={editFormData.discountType}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discount Value
                    </Label>
                    <div className="relative">
                      <Input
                        name="discountValue"
                        type="number"
                        step="0.01"
                        value={editFormData.discountValue}
                        onChange={handleEditChange}
                        placeholder="0"
                        className="w-full pr-8 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {editFormData.discountType === "percentage" ? "%" : "₦"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original Price (₦)
                    </Label>
                    <Input
                      name="originalPrice"
                      type="number"
                      step="0.01"
                      value={editFormData.originalPrice}
                      onChange={handleEditChange}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discounted Price (Auto-calculated)
                    </Label>
                    <div className="relative">
                      <Input
                        name="discountedPrice"
                        type="number"
                        step="0.01"
                        value={editFormData.discountedPrice}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        disabled
                      />
                    </div>
                    {calculationWarning && (
                      <p className="text-orange-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {calculationWarning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Validity Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                  Validity
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valid From
                    </Label>
                    <Input
                      name="validFrom"
                      type="datetime-local"
                      value={editFormData.validFrom}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valid To
                    </Label>
                    <Input
                      name="validTo"
                      type="datetime-local"
                      value={editFormData.validTo}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
              {/* Additional Discount Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                  Additional Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Order Value
                    </Label>
                    <Input
                      name="minOrderValue"
                      type="number"
                      value={editFormData.minOrderValue}
                      onChange={handleEditChange}
                      placeholder="0"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Uses
                    </Label>
                    <Input
                      name="maxUses"
                      type="number"
                      value={editFormData.maxUses}
                      onChange={handleEditChange}
                      placeholder="0"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code
                    </Label>
                    <Input
                      name="code"
                      value={editFormData.code}
                      onChange={handleEditChange}
                      placeholder="Enter promo code"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Applies To
                    </Label>
                    <select
                      name="appliesTo"
                      value={editFormData.appliesTo}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">All</option>
                      <option value="item">Item</option>
                      <option value="category">Category</option>
                      <option value="restaurant">Restaurant</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target ID
                  </Label>
                  <Input
                    name="targetId"
                    value={editFormData.targetId}
                    onChange={handleEditChange}
                    placeholder="Enter target ID"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </>
          )}

          {/* Image Upload Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
              Image
            </h4>
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload New Image (Optional)
              </Label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-400 transition">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-sm">
                        {newImage ? newImage.name : "Choose an image"}
                      </span>
                    </div>
                  </div>
                  <Input
                    type="file"
                    onChange={handleEditFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
              {newImage && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  New image selected
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={
                isUpdating ||
                (type === "discount" && Boolean(calculationWarning))
              }
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition font-medium flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Update Item
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
