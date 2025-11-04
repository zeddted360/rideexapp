"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  IMenuItemFetched,
  IPopularItemFetched,
  IFeaturedItemFetched,
  IDiscountFetched,
} from "../../types/types";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Image as ImageIcon,
  Package,
  TrendingUp,
  Award,
  Edit2,
  Trash2,
  Loader2,
  Utensils,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import {
  listAsyncFeaturedItems,
  updateAsyncFeaturedItem,
  deleteAsyncFeaturedItem,
  updateApprovalAsyncFeaturedItem,
} from "@/state/featuredSlice";
import {
  listAsyncPopularItems,
  updateAsyncPopularItem,
  deleteAsyncPopularItem,
  updateApprovalAsyncPopularItem,
} from "@/state/popularSlice";
import {
  listAsyncMenusItem,
  updateAsyncMenuItem,
  deleteAsyncMenuItem,
  updateApprovalAsyncMenuItem,
} from "@/state/menuSlice";
import {
  listAsyncDiscounts,
  updateAsyncDiscount,
  deleteAsyncDiscount,
} from "@/state/discountSlice";
import { getAsyncRestaurantById } from "@/state/restaurantSlice";
import { useRestaurantById } from "@/hooks/useRestaurant";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type ContentType = "menu" | "popular" | "featured" | "discount";
type ContentItem = IMenuItemFetched | IPopularItemFetched | IFeaturedItemFetched | IDiscountFetched;

// ItemRow component for desktop view (renders <tr>)
const ItemRow = ({
  item,
  activeContentTab,
  handleApproval,
  handleEdit,
  handleDeleteClick,
}: {
  item: ContentItem;
  activeContentTab: ContentType;
  handleApproval: (itemId: string, isApproved: boolean) => Promise<void>;
  handleEdit: (item: ContentItem) => void;
  handleDeleteClick: (item: ContentItem) => void;
}) => {
  const isDiscount = activeContentTab === "discount";
  const restaurantId = isDiscount
    ? (item as IDiscountFetched).restaurantId
    : "restaurantId" in item
      ? item.restaurantId
      : (item as any).restaurant || "";
  const { restaurant, loading, error } = useRestaurantById(restaurantId || null);

  const getTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    if (diff < 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h left`;
  };

  const getApprovalBadge = (isApproved: boolean | undefined) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  // Common content for both desktop and mobile views
  const renderContent = () => (
    <div className="flex items-center gap-3">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
        {item.image ? (
          <Image
            src={fileUrl(getBucketId(activeContentTab), item.image as string)}
            alt={isDiscount ? (item as IDiscountFetched).title : item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
            width={50}
            height={50}
            quality={100}
          />
        ) : null}
        <div
          className={`w-full h-full flex items-center justify-center text-gray-400 absolute top-0 left-0 ${
            item.image ? "hidden" : ""
          }`}
        >
          <ImageIcon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {isDiscount ? (item as IDiscountFetched).title : item.name}
        </p>
        <p className="text-sm text-gray-500 line-clamp-2">
          {isDiscount ? (item as IDiscountFetched).description : item.description}
        </p>
        {restaurantId && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-orange-700 dark:text-orange-300">
            <Utensils className="w-3 h-3" />
            {loading === "pending" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : error ? (
              <span className="text-xs text-red-500">Error</span>
            ) : (
              <span>{restaurant?.name || "Restaurant not found"}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="text-sm text-gray-500">
      {!isDiscount ? (
        <>
          <p className="flex items-center gap-1 mb-1">
            <span className="font-medium">Category:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                item.category === "veg" || item.category === "Vegetarian"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {item.category}
            </span>
          </p>
          {("cookTime" in item) && (
            <p className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.cookTime}
            </p>
          )}
          {("cookingTime" in item) && (
            <p className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.cookingTime}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="flex items-center gap-1 mb-1">
            <span className="font-medium">Applies To:</span>
            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {(item as IDiscountFetched).appliesTo}
            </span>
          </p>
          <p className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getTimeLeft((item as IDiscountFetched).validTo)}
          </p>
        </>
      )}
    </div>
  );

  const renderPrice = () => (
    <div>
      {!isDiscount ? (
        <>
          <p className="font-bold text-orange-600">₦{item.price}</p>
          {item.originalPrice && item.originalPrice !== item.price && (
            <p className="text-sm text-gray-500 line-through">
              ₦{item.originalPrice}
            </p>
          )}
        </>
      ) : (
        <p className="font-bold text-orange-600">
          {(item as IDiscountFetched).discountType === "percentage"
            ? `${(item as IDiscountFetched).discountValue}%`
            : `₦${(item as IDiscountFetched).discountValue}`}
        </p>
      )}
    </div>
  );

  const renderRating = () => (
    <>
      {!isDiscount ? (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{item.rating}</span>
          {("reviewCount" in item) && (
            <span className="text-xs text-gray-500">({item.reviewCount})</span>
          )}
        </div>
      ) : (
        <span className="text-sm text-gray-500">N/A</span>
      )}
    </>
  );

  const renderActions = () => (
    <div className="flex gap-2">
      <Button
        onClick={() => handleApproval(item.$id, true)}
        disabled={item.isApproved}
        className={`p-2 rounded-lg transition ${
          item.isApproved
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
        title="Approve"
      >
        <CheckCircle className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => handleApproval(item.$id, false)}
        disabled={!item.isApproved && item.isApproved !== undefined}
        className={`p-2 rounded-lg transition ${
          !item.isApproved && item.isApproved !== undefined
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
        title="Reject"
      >
        <XCircle className="w-4 h-4" />
      </Button>
      <button
        onClick={() => handleEdit(item)}
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        title="Edit"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDeleteClick(item)}
        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition">
      <td className="py-4 px-6">{renderContent()}</td>
      <td className="py-4 px-6">{renderDetails()}</td>
      <td className="py-4 px-6">{renderPrice()}</td>
      <td className="py-4 px-6">{renderRating()}</td>
      <td className="py-4 px-6">{getApprovalBadge(item.isApproved)}</td>
      <td className="py-4 px-6">{renderActions()}</td>
    </tr>
  );
};

// MobileItem component for mobile view (renders <div>)
const MobileItem = ({
  item,
  activeContentTab,
  handleApproval,
  handleEdit,
  handleDeleteClick,
}: {
  item: ContentItem;
  activeContentTab: ContentType;
  handleApproval: (itemId: string, isApproved: boolean) => Promise<void>;
  handleEdit: (item: ContentItem) => void;
  handleDeleteClick: (item: ContentItem) => void;
}) => {
  const isDiscount = activeContentTab === "discount";
  const restaurantId = isDiscount
    ? (item as IDiscountFetched).restaurantId
    : "restaurantId" in item
      ? item.restaurantId
      : (item as any).restaurant || "";
  const { restaurant, loading, error } = useRestaurantById(restaurantId || null);

  const getTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    if (diff < 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h left`;
  };

  const getApprovalBadge = (isApproved: boolean | undefined) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  return (
    <div className="lg:hidden bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4">
      <div className="flex gap-3 mb-3">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
          {item.image ? (
            <Image
              src={fileUrl(getBucketId(activeContentTab), item.image as string)}
              alt={isDiscount ? (item as IDiscountFetched).title : item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
              width={50}
              height={50}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center text-gray-400 absolute top-0 left-0 ${
              item.image ? "hidden" : ""
            }`}
          >
            <ImageIcon className="w-6 h-6" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            {isDiscount ? (item as IDiscountFetched).title : item.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {isDiscount ? (item as IDiscountFetched).description : item.description}
          </p>
          {restaurantId && (
            <div className="flex items-center gap-2 mt-1.5 text-xs text-orange-700 dark:text-orange-300">
              <Utensils className="w-3 h-3" />
              {loading === "pending" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : error ? (
                <span className="text-xs text-red-500">Error</span>
              ) : (
                <span>{restaurant?.name || "Restaurant not found"}</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-600">
                {!isDiscount
                  ? `₦${item.price}`
                  : `${(item as IDiscountFetched).discountType} ${(item as IDiscountFetched).discountValue}`}
              </span>
              {!isDiscount && item.originalPrice && item.originalPrice !== item.price && (
                <span className="text-sm text-gray-500 line-through">
                  ₦{item.originalPrice}
                </span>
              )}
            </div>
            {!isDiscount ? (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{item.rating}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">N/A</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              !isDiscount
                ? item.category === "veg" || item.category === "Vegetarian"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {!isDiscount ? item.category : (item as IDiscountFetched).appliesTo}
          </span>
          {getApprovalBadge(item.isApproved)}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleApproval(item.$id, true)}
            disabled={item.isApproved}
            className={`flex-1 p-2 rounded-lg transition ${
              item.isApproved
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <CheckCircle className="w-4 h-4 mx-auto" />
            <span className="text-xs mt-1 block">Approve</span>
          </Button>
          <Button
            onClick={() => handleApproval(item.$id, false)}
            disabled={!item.isApproved && item.isApproved !== undefined}
            className={`flex-1 p-2 rounded-lg transition ${
              !item.isApproved && item.isApproved !== undefined
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            <XCircle className="w-4 h-4 mx-auto" />
            <span className="text-xs mt-1 block">Reject</span>
          </Button>
          <button
            onClick={() => handleEdit(item)}
            className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit2 className="w-4 h-4 mx-auto" />
            <span className="text-xs mt-1 block">Edit</span>
          </button>
          <button
            onClick={() => handleDeleteClick(item)}
            className="flex-1 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Trash2 className="w-4 h-4 mx-auto" />
            <span className="text-xs mt-1 block">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get bucket ID
const getBucketId = (activeContentTab: ContentType): string => {
  const { popularBucketId, menuBucketId, featuredBucketId, discountBucketId } = validateEnv();
  switch (activeContentTab) {
    case "menu":
      return menuBucketId;
    case "popular":
      return popularBucketId;
    case "featured":
      return featuredBucketId;
    case "discount":
      return discountBucketId;
    default:
      return "";
  }
};

export default function ContentModerationTab() {
  // State management
  const [activeContentTab, setActiveContentTab] = useState<ContentType>("menu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const dispatch = useDispatch<AppDispatch>();
  const { featuredItems } = useSelector((state: RootState) => state.featuredItem);
  const { menuItems } = useSelector((state: RootState) => state.menuItem);
  const { popularItems } = useSelector((state: RootState) => state.popularItem);
  const { discounts } = useSelector((state: RootState) => state.discounts);

  // Edit/Delete states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [newImage, setNewImage] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string>("");

  // Memoized getRestaurantName
  const getRestaurantName = useCallback(
    async (restaurantId: string, dispatch: AppDispatch): Promise<string> => {
      try {
        const response = await dispatch(getAsyncRestaurantById(restaurantId)).unwrap();
        return response.name || "Unknown restaurant";
      } catch (error) {
        console.error(error instanceof Error ? error.message : "Could not fetch restaurant");
        return "Unknown restaurant";
      }
    },
    []
  );

  useEffect(() => {
    if (editFormData.restaurantId && showEditModal) {
      const fetchName = async () => {
        const name = await getRestaurantName(editFormData.restaurantId, dispatch);
        setRestaurantName(name);
      };
      fetchName();
    }
  }, [editFormData.restaurantId, showEditModal, getRestaurantName, dispatch]);

  // Effect to fetch data when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setError(null);
    setLoading(true);

    let action;
    switch (activeContentTab) {
      case "menu":
        action = listAsyncMenusItem();
        break;
      case "popular":
        action = listAsyncPopularItems();
        break;
      case "featured":
        action = listAsyncFeaturedItems();
        break;
      case "discount":
        action = listAsyncDiscounts();
        break;
      default:
        setLoading(false);
        return;
    }

    dispatch(action as any)
      .then(() => setLoading(false))
      .catch((err: any) => {
        setError(err.message || "Failed to fetch items");
        setLoading(false);
      });
  }, [activeContentTab, dispatch]);

  // Approval handler
  const handleApproval = async (itemId: string, isApproved: boolean) => {
    try {
      setIsUpdating(true);
      let updateData = { isApproved };

      let action;
      switch (activeContentTab) {
        case "menu":
          action = updateApprovalAsyncMenuItem({ itemId, isApproved: updateData.isApproved });
          break;
        case "popular":
          action = updateApprovalAsyncPopularItem({ itemId, isApproved: updateData.isApproved });
          break;
        case "featured":
          action = updateApprovalAsyncFeaturedItem({ itemId, isApproved: updateData.isApproved });
          break;
        case "discount":
          action = updateAsyncDiscount({ id: itemId, data: updateData });
          break;
      }

      if (action) {
        await dispatch(action as any).unwrap();
        toast.success(`Item ${isApproved ? "approved" : "rejected"} successfully`);
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast.error("Failed to update approval status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Edit handler
  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item);
    const commonData = {
      name: item.name,
      description: item.description || "",
      price: item.price,
      rating: item.rating,
      category: item.category,
      restaurantId: "restaurantId" in item ? item.restaurantId : (item as any).restaurant || "",
      isApproved: item.isApproved,
    };
    let formData: any = { ...commonData };
    switch (activeContentTab) {
      case "menu":
        formData = {
          ...formData,
          originalPrice: (item as IMenuItemFetched).originalPrice || "",
          cookTime: (item as IMenuItemFetched).cookTime || "",
        };
        break;
      case "popular":
        formData = {
          ...formData,
          originalPrice: (item as IPopularItemFetched).originalPrice || "",
          cookingTime: (item as IPopularItemFetched).cookingTime || "",
          reviewCount: "reviewCount" in item ? (item as IPopularItemFetched).reviewCount : 0,
          isPopular: "isPopular" in item ? (item as IPopularItemFetched).isPopular : false,
          discount: "discount" in item ? (item as IPopularItemFetched).discount : "",
        };
        break;
      case "featured":
        break;
      case "discount":
        formData = {
          title: (item as IDiscountFetched).title,
          description: (item as IDiscountFetched).description,
          discountType: (item as IDiscountFetched).discountType,
          discountValue: (item as IDiscountFetched).discountValue,
          originalPrice: (item as IDiscountFetched).originalPrice,
          discountedPrice: (item as IDiscountFetched).discountedPrice,
          validFrom: (item as IDiscountFetched).validFrom,
          validTo: (item as IDiscountFetched).validTo,
          minOrderValue: (item as IDiscountFetched).minOrderValue,
          maxUses: (item as IDiscountFetched).maxUses,
          code: (item as IDiscountFetched).code,
          appliesTo: (item as IDiscountFetched).appliesTo,
          targetId: (item as IDiscountFetched).targetId,
          isActive: (item as IDiscountFetched).isActive,
          isApproved: (item as IDiscountFetched).isApproved,
          restaurantId: (item as IDiscountFetched).restaurantId,
          extras: (item as IDiscountFetched).extras,
        };
        break;
      default:
        break;
    }
    setEditFormData(formData);
    setNewImage(null);
    setShowEditModal(true);
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      setIsUpdating(true);
      const itemId = selectedItem.$id;
      let updateData: any;
      let action;
      switch (activeContentTab) {
        case "menu":
          updateData = {
            name: editFormData.name,
            description: editFormData.description,
            price: editFormData.price,
            originalPrice: editFormData.originalPrice,
            rating: parseFloat(editFormData.rating),
            cookTime: editFormData.cookTime,
            category: editFormData.category,
            restaurantId: editFormData.restaurantId,
            isApproved: editFormData.isApproved,
          };
          action = updateAsyncMenuItem({ itemId, data: updateData, newImage });
          break;
        case "popular":
          updateData = {
            name: editFormData.name,
            description: editFormData.description,
            price: editFormData.price,
            originalPrice: editFormData.originalPrice,
            rating: parseFloat(editFormData.rating),
            reviewCount: parseInt(editFormData.reviewCount?.toString() || "0", 10),
            category: editFormData.category,
            cookingTime: editFormData.cookingTime,
            isPopular: editFormData.isPopular,
            discount: editFormData.discount,
            restaurantId: editFormData.restaurantId,
            isApproved: editFormData.isApproved,
          };
          action = updateAsyncPopularItem({ itemId, data: updateData, newImage });
          break;
        case "featured":
          updateData = {
            name: editFormData.name,
            description: editFormData.description,
            price: editFormData.price,
            rating: parseFloat(editFormData.rating),
            category: editFormData.category,
            restaurantId: editFormData.restaurantId,
            isApproved: editFormData.isApproved,
          };
          action = updateAsyncFeaturedItem({ itemId, data: updateData, newImage });
          break;
        case "discount":
          updateData = {
            title: editFormData.title,
            description: editFormData.description,
            discountType: editFormData.discountType,
            discountValue: parseFloat(editFormData.discountValue?.toString() || "0"),
            originalPrice: editFormData.originalPrice
              ? parseFloat(editFormData.originalPrice.toString())
              : undefined,
            discountedPrice: editFormData.discountedPrice
              ? parseFloat(editFormData.discountedPrice.toString())
              : undefined,
            validFrom: editFormData.validFrom,
            validTo: editFormData.validTo,
            minOrderValue: editFormData.minOrderValue
              ? parseFloat(editFormData.minOrderValue.toString())
              : undefined,
            maxUses: editFormData.maxUses ? parseInt(editFormData.maxUses.toString()) : undefined,
            code: editFormData.code,
            appliesTo: editFormData.appliesTo,
            targetId: editFormData.targetId,
            isActive: editFormData.isActive,
            isApproved: editFormData.isApproved,
            restaurantId: editFormData.restaurantId,
            extras: editFormData.extras,
          };
          action = updateAsyncDiscount({ id: itemId, data: updateData, imageFile: newImage || null });
          break;
      }

      if (action) {
        await dispatch(action as any).unwrap();
        toast.success("Item updated successfully");
        setShowEditModal(false);
        dispatch(
          (
            activeContentTab === "menu"
              ? listAsyncMenusItem()
              : activeContentTab === "popular"
              ? listAsyncPopularItems()
              : activeContentTab === "featured"
              ? listAsyncFeaturedItems()
              : listAsyncDiscounts()
          ) as any
        );
      }
    } catch (error) {
      toast.error("Failed to update item");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete handler
  const handleDeleteClick = (item: ContentItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setIsDeleting(true);
      let action;
      switch (activeContentTab) {
        case "menu":
          action = deleteAsyncMenuItem({ itemId: selectedItem.$id, imageId: selectedItem.image as string });
          break;
        case "popular":
          action = deleteAsyncPopularItem({ itemId: selectedItem.$id, imageId: selectedItem.image as string });
          break;
        case "featured":
          action = deleteAsyncFeaturedItem({ itemId: selectedItem.$id, imageId: selectedItem.image as string });
          break;
        case "discount":
          action = deleteAsyncDiscount(selectedItem.$id);
          break;
      }

      if (action) {
        await dispatch(action as any).unwrap();
        toast.success("Item deleted successfully");
        setShowDeleteModal(false);
        dispatch(
          (
            activeContentTab === "menu"
              ? listAsyncMenusItem()
              : activeContentTab === "popular"
              ? listAsyncPopularItems()
              : activeContentTab === "featured"
              ? listAsyncFeaturedItems()
              : listAsyncDiscounts()
          ) as any
        );
      }
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  // Get current items based on active tab
  const getCurrentItems = (): ContentItem[] => {
    switch (activeContentTab) {
      case "menu":
        return menuItems;
      case "popular":
        return popularItems;
      case "featured":
        return featuredItems;
      case "discount":
        return discounts;
      default:
        return [];
    }
  };

  // Filter items
  const filteredItems = getCurrentItems().filter((item) => {
    const itemName = activeContentTab === "discount" ? (item as IDiscountFetched).title : item.name;
    const matchesSearch =
      itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApproval =
      approvalFilter === "all" ||
      (approvalFilter === "approved" && item.isApproved) ||
      (approvalFilter === "pending" && !item.isApproved);

    return matchesSearch && matchesApproval;
  });

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTabIcon = (type: ContentType) => {
    switch (type) {
      case "menu":
        return <Package className="w-4 h-4" />;
      case "popular":
        return <TrendingUp className="w-4 h-4" />;
      case "featured":
        return <Award className="w-4 h-4" />;
      case "discount":
        return <Award className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const getTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    if (diff < 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h left`;
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Content Moderation
        </h2>

        {/* Content Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
          {(["menu", "popular", "featured", "discount"] as ContentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveContentTab(type)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeContentTab === type
                  ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600"
              }`}
            >
              {getTabIcon(type)}
              {type.charAt(0).toUpperCase() + type.slice(1)} Items
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1 sm:flex-none">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as "all" | "approved" | "pending")}
              className="w-full pl-10 pr-8 py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 appearance-none"
            >
              <option value="all">All Items</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 font-semibold p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <thead className="bg-orange-100 dark:bg-orange-900/30">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Item
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Details
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Price
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Rating
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <ItemRow
                      key={item.$id}
                      item={item}
                      activeContentTab={activeContentTab}
                      handleApproval={handleApproval}
                      handleEdit={handleEdit}
                      handleDeleteClick={handleDeleteClick}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <MobileItem
                  key={item.$id}
                  item={item}
                  activeContentTab={activeContentTab}
                  handleApproval={handleApproval}
                  handleEdit={handleEdit}
                  handleDeleteClick={handleDeleteClick}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                No items found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredItems.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-300 text-sm text-center">
                Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(filteredItems.length / itemsPerPage))
                  )
                }
                disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)}
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
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
                  Edit {activeContentTab.charAt(0).toUpperCase() + activeContentTab.slice(1)} Item
                </h3>
              </div>
              <Button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            <form className="space-y-5">
              {activeContentTab !== "discount" ? (
                <>
                  {/* Basic Information Section */}
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
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Pricing</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Price (₦)
                        </label>
                        <input
                          name="price"
                          type="number"
                          value={editFormData.price}
                          onChange={handleEditChange}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      {("originalPrice" in editFormData && editFormData.originalPrice !== undefined) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Original Price (₦)
                          </label>
                          <input
                            name="originalPrice"
                            type="number"
                            value={editFormData.originalPrice}
                            onChange={handleEditChange}
                            placeholder="0.00"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      )}

                      {("discount" in editFormData && editFormData.discount !== undefined) && (
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
                      {("cookTime" in editFormData || "cookingTime" in editFormData) && (
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cooking Time
                          </Label>
                          <Input
                            name={"cookTime" in editFormData ? "cookTime" : "cookingTime"}
                            value={editFormData.cookTime || editFormData.cookingTime || ""}
                            onChange={handleEditChange}
                            placeholder="e.g., 20-25 mins"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      )}

                      {("reviewCount" in editFormData && editFormData.reviewCount !== undefined) && (
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Review Count
                          </Label>
                          <input
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
                          title="This field is non editable"
                          name="restaurantId"
                          disabled
                          value={restaurantName || editFormData.restaurantId}
                          onChange={handleEditChange}
                          placeholder="Enter restaurant ID"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Discount Specific Fields */}
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
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Discount Value
                        </Label>
                        <Input
                          name="discountValue"
                          type="number"
                          min="0"
                          value={editFormData.discountValue}
                          onChange={handleEditChange}
                          placeholder="e.g., 20 or 500"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Validity Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Validity</h4>

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

                  {/* Scope Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Scope</h4>

                    <div className="grid grid-cols-2 gap-4">
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

                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Target ID
                        </Label>
                        <Input
                          name="targetId"
                          value={editFormData.targetId}
                          onChange={handleEditChange}
                          placeholder="Item/Category/Restaurant ID"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Promo Code (Optional)
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
                          Min Order Value (₦)
                        </Label>
                        <Input
                          name="minOrderValue"
                          type="number"
                          min="0"
                          value={editFormData.minOrderValue}
                          onChange={handleEditChange}
                          placeholder="0"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                      Restaurant
                    </h4>

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Restaurant
                      </Label>
                      <Input
                        title="This field is non editable"
                        name="restaurantId"
                        disabled
                        value={restaurantName || editFormData.restaurantId}
                        onChange={handleEditChange}
                        placeholder="Enter restaurant ID"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Image Upload Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Image</h4>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload New Image (Optional)
                  </Label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-400 transition">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <ImageIcon className="w-5 h-5" />
                          <span className="text-sm">{newImage ? newImage.name : "Choose an image"}</span>
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

              {/* Approval Status Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Status</h4>

                {activeContentTab === "discount" ? (
                  <div className="space-y-4">
                    <Label className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition">
                      <Input
                        type="checkbox"
                        name="isActive"
                        checked={editFormData.isActive}
                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                        className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Active Discount
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          This discount will be available when active
                        </p>
                      </div>
                    </Label>

                    <Label className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition">
                      <Input
                        type="checkbox"
                        name="isApproved"
                        checked={editFormData.isApproved}
                        onChange={(e) => setEditFormData({ ...editFormData, isApproved: e.target.checked })}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Approved for display
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          This item will be visible to customers when approved
                        </p>
                      </div>
                    </Label>
                  </div>
                ) : (
                  <Label className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition">
                    <Input
                      type="checkbox"
                      name="isApproved"
                      checked={editFormData.isApproved}
                      onChange={(e) => setEditFormData({ ...editFormData, isApproved: e.target.checked })}
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Approved for display
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        This item will be visible to customers when approved
                      </p>
                    </div>
                  </Label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isUpdating}
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
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setShowDeleteModal(false)} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="animate-spin mr-2" /> : null}
                Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}