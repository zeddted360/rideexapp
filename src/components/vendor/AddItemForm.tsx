"use client";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FeaturedItemFormData,
  featuredItemSchema,
  MenuItemFormData,
  menuItemSchema,
  PopularItemFormData,
  popularItemSchema,
  DiscountFormData,
  discountSchema,
} from "@/utils/schema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import {
  listAsyncRestaurants,
  getAsyncRestaurantById,
} from "@/state/restaurantSlice";
import {
  createAsyncMenuItem,
  listAsyncMenusItem,
  deleteAsyncMenuItem,
} from "@/state/menuSlice";
import {
  createAsyncDiscount,
  listAsyncDiscounts,
  deleteAsyncDiscount,
} from "@/state/discountSlice";
import toast from "react-hot-toast";
import {
  createAsyncFeaturedItem,
  listAsyncFeaturedItems,
  deleteAsyncFeaturedItem,
} from "@/state/featuredSlice";
import {
  createAsyncPopularItem,
  listAsyncPopularItems,
  deleteAsyncPopularItem,
} from "@/state/popularSlice";
import { fetchVendorByIdAsync } from "@/state/vendorSlice";
import {
  IDiscount,
  IRestaurantFetched,
  IMenuItemFetched,
  IFeaturedItemFetched,
  IPopularItemFetched,
  IFetchedExtras,
  IDiscountFetched,
  IVendorFetched,
} from "../../../types/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import MenuItemForm from "../forms/MenuItemForm";
import FeaturedItemForm from "../forms/FeaturedItemForm";
import PopularItemForm from "../forms/PopularItemForm";
import DiscountForm from "../forms/DiscountForm";
import { Button } from "../ui/button";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import EditItemModal from "./EditItemModal";
import ExtrasManagementForm from "../forms/ExtrasManagementForm";
import AccessRestriction from "./AccessRestriction";
import AddItemSidebar from "./AddItemSidebar";
import ModernLoader from "../ModernLoader";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AccountTab from "./AccountTab";
import EditMenuTab from "./EditMenuTab";
import { listAsyncExtras } from "@/state/extraSlice";
import { showErrorToast } from "./CustomToast";
import { Trash2, Edit2 } from "lucide-react";
import { ItemIndicator } from "@radix-ui/react-select";

const AddFoodItemForm = () => {
  const [activeTab, setActiveTab] = useState<
    | "account"
    | "menu-item"
    | "featured-item"
    | "popular-item"
    | "discount"
    | "edit-menu"
    | "extras"
  >("account");
  const [subActiveTab, setSubActiveTab] = useState<
    "menu" | "featured" | "popular" | "discount"
  >("menu");
  const [loading, setLoading] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [vendorStatus, setVendorStatus] = useState<
    "pending" | "approved" | "rejected" | null
  >(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [filteredRestaurants, setFilteredRestaurants] = useState<
    IRestaurantFetched[]
  >([]);
  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    | IMenuItemFetched
    | IFeaturedItemFetched
    | IPopularItemFetched
    | IDiscountFetched
    | null
  >(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [newImage, setNewImage] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string>("");
  // Extras state for menu items
  const [menuSelectedExtras, setMenuSelectedExtras] = useState<
    IFetchedExtras[]
  >([]);
  // Extras state for featured items
  const [featuredSelectedExtras, setFeaturedSelectedExtras] = useState<
    IFetchedExtras[]
  >([]);
  // Extras state for popular items
  const [popularSelectedExtras, setPopularSelectedExtras] = useState<
    IFetchedExtras[]
  >([]);
  // Extras state for discount
  const [discountSelectedExtras, setDiscountSelectedExtras] = useState<
    IFetchedExtras[]
  >([]);
  // State for selected extra ID (for MenuItemForm)
  const [selectedExtraId, setSelectedExtraId] = useState<string | undefined>(
    undefined
  );

  const dispatch = useDispatch<AppDispatch>();
  const { restaurants } = useSelector((state: RootState) => state.restaurant);
  const { featuredItems } = useSelector(
    (state: RootState) => state.featuredItem
  );
  const { popularItems } = useSelector((state: RootState) => state.popularItem);
  const { menuItems } = useSelector((state: RootState) => state.menuItem);
  const { discounts } = useSelector((state: RootState) => state.discounts);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Fetch vendor status and extras if user is a vendor
  useEffect(() => {
    if (user?.role === "vendor" && user?.userId) {
      setIsCheckingAccess(true);
      dispatch(fetchVendorByIdAsync(user.userId))
        .unwrap()
        .then((vendor: IVendorFetched) => {
          setVendorStatus(vendor.status);
          setIsCheckingAccess(false);
        })
        .catch((error) => {
          console.error("Failed to fetch vendor status:", error);
          setVendorStatus("rejected");
          setIsCheckingAccess(false);
        });
      dispatch(listAsyncExtras(user.userId));
    } else {
      setIsCheckingAccess(false);
    }
  }, [user?.role, user?.userId, dispatch]);

  // Access control helper
  const hasAccess = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    if (user.role === "user" || user.role === null) return false;
    if (user.role === "vendor") return vendorStatus === "approved";
    return true; // for admin and others
  }, [isAuthenticated, user, vendorStatus]);

  // Load data
  useEffect(() => {
    if (hasAccess) {
      dispatch(listAsyncRestaurants());
      dispatch(listAsyncDiscounts());
      dispatch(listAsyncFeaturedItems());
      dispatch(listAsyncPopularItems());
      dispatch(listAsyncMenusItem());
      if (user?.userId) {
        dispatch(listAsyncExtras(user.userId)); // Ensure extras are fetched
      }
    }
  }, [dispatch, hasAccess, user?.userId]);

  // Redirect if no access
  useEffect(() => {
    if (!isCheckingAccess && !hasAccess) {
      router.push("/");
    }
  }, [hasAccess, isCheckingAccess, router]);

  // Update filteredRestaurants when restaurants or searchCategory changes
  useEffect(() => {
    const vendorRestaurants = restaurants.filter(
      (r: IRestaurantFetched) => r.vendorId === user?.userId
    );
    if (!searchCategory.trim()) {
      setFilteredRestaurants(vendorRestaurants);
    } else {
      setFilteredRestaurants(
        vendorRestaurants.filter((restaurant) =>
          restaurant.category
            .toLowerCase()
            .includes(searchCategory.toLowerCase())
        )
      );
    }
  }, [restaurants, searchCategory, user?.userId]);

  const getRestaurantName = async (restaurantId: string): Promise<string> => {
    try {
      const response = await dispatch(
        getAsyncRestaurantById(restaurantId)
      ).unwrap();
      return response.name || "Unknown restaurant";
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Could not fetch restaurant"
      );
      return "Unknown restaurant";
    }
  };

  useEffect(() => {
    if (editFormData.restaurantId && showEditModal) {
      const fetchName = async () => {
        const name = await getRestaurantName(editFormData.restaurantId);
        setRestaurantName(name);
      };
      fetchName();
    }
  }, [editFormData.restaurantId, showEditModal, dispatch]);

  // Filtered items for edit menu
  const filteredMenuItems = useMemo(
    () =>
      menuItems.filter((item: IMenuItemFetched) =>
        filteredRestaurants.some(
          (r: IRestaurantFetched) => r.$id === item.restaurantId
        )
      ),
    [menuItems, filteredRestaurants]
  );

  const filteredFeaturedItems = useMemo(
    () =>
      featuredItems.filter((item: IFeaturedItemFetched) =>
        filteredRestaurants.some(
          (r: IRestaurantFetched) => r.$id === item.restaurantId
        )
      ),
    [featuredItems, filteredRestaurants]
  );

  const filteredPopularItems = useMemo(
    () =>
      popularItems.filter((item: IPopularItemFetched) =>
        filteredRestaurants.some(
          (r: IRestaurantFetched) => r.$id === item.restaurantId
        )
      ),
    [popularItems, filteredRestaurants]
  );


  const filteredDiscounts = useMemo(
    () =>
      discounts.filter((item: IDiscountFetched) =>
        filteredRestaurants.some(
          (res: IRestaurantFetched) => res.$id === item.restaurantId
        )
      ),
    [discounts, filteredRestaurants]
  );

  // Initialize forms
  const menuItemForm = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      image: undefined,
      cookTime: "",
      category: undefined,
      restaurantId: "",
      needsTakeawayContainer: false,
      extraPortion: false,
    },
  });

  const featuredItemForm = useForm<FeaturedItemFormData>({
    resolver: zodResolver(featuredItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      rating: 0,
      restaurantId: "",
      category: "non-veg",
    },
    mode: "onChange",
  });

  const popularItemForm = useForm<PopularItemFormData>({
    resolver: zodResolver(popularItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      rating: 0,
      reviewCount: 0,
      image: undefined,
      category: "",
      cookingTime: "",
      isPopular: true,
      discount: "",
      restaurantId: "",
    },
    mode: "onChange",
  });

  const discountForm = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      originalPrice: 0,
      discountedPrice: 0,
      validFrom: "",
      validTo: "",
      minOrderValue: 0,
      maxUses: 0,
      code: "",
      appliesTo: "new",
      targetId: "",
      image: undefined,
      isActive: true,
      restaurantId: "",
    },
    mode: "onChange",
  });

  // Dynamic target options for DiscountForm
  const [targetOptions, setTargetOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const appliesTo = discountForm.watch("appliesTo");

  useEffect(() => {
    let options: { label: string; value: string }[] = [];
    switch (appliesTo) {
      case "new":
        options = restaurants.map((r: IRestaurantFetched) => ({
          label: r.name,
          value: r.$id,
        }));
        break;
      case "deal":
        options = [];
        break;
      case "exclusive":
        options = [
          { label: "Veg", value: "veg" },
          { label: "Non-Veg", value: "non-veg" },
        ];
        break;
      default:
        options = [];
    }
    setTargetOptions(options);
  }, [appliesTo, restaurants]);

  // Handlers for create
  const handleMenuItemSubmit = async (data: MenuItemFormData) => {
    if (user?.role === "user") return;
    setLoading(true);
    try {
      const payload: any = {
        ...data,
        extras: [
          ...menuSelectedExtras.map((extra) => extra.$id),
          ...(selectedExtraId ? [selectedExtraId] : []),
        ],
      };
      // return;
      await dispatch(createAsyncMenuItem(payload)).unwrap();
      menuItemForm.reset();
      setMenuSelectedExtras([]);
      setSelectedExtraId(undefined);
      toast.success("Menu item added successfully!");
    } catch (error) {
      toast.error("Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedItemSubmit = async (data: FeaturedItemFormData) => {
    if (user?.role === "user") return;
    setLoading(true);
    try {
      const payload: any = {
        ...data,
        extras: featuredSelectedExtras.map((extra) => extra.$id),
      };
      await dispatch(createAsyncFeaturedItem(payload)).unwrap();
      featuredItemForm.reset();
      setFeaturedSelectedExtras([]);
    } catch (error) {
      toast.error("Failed to add featured item");
    } finally {
      setLoading(false);
    }
  };

  const handlePopularItemSubmit = async (data: PopularItemFormData) => {
    if (user?.role === "user") return;
    setLoading(true);
    try {
      const payload: any = {
        ...data,
        extras: popularSelectedExtras.map((extra) => extra.$id),
      };
      await dispatch(createAsyncPopularItem(payload)).unwrap();
      popularItemForm.reset();
      setPopularSelectedExtras([]);
    } catch (error) {
      toast.error("Failed to add popular item");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountSubmit = async (data: DiscountFormData) => {
    if (user?.role === "user") return;
    if (filteredDiscounts.length > 5) {
      showErrorToast(
        `You’ve reached the maximum of 5 discounts. Wait for a discount item to elapse to adjust your cart.`,
        "",
        () => {}
      );
      return;
    }
    setLoading(true);
    try {
      const discountData: Partial<IDiscount> = {
        title: data.title,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        originalPrice: data.originalPrice,
        discountedPrice: data.discountedPrice,
        validFrom: data.validFrom,
        validTo: data.validTo,
        minOrderValue: data.minOrderValue,
        maxUses: data.maxUses,
        code: data.code,
        appliesTo: data.appliesTo,
        targetId: data.targetId,
        image: data.image,
        isActive: data.isActive,
        restaurantId: data.restaurantId,
        extras: discountSelectedExtras.map((extra) => extra.$id),
      };
      await dispatch(createAsyncDiscount(discountData)).unwrap();
      discountForm.reset();
      setDiscountSelectedExtras([]);
    } catch (error) {
      toast.error("Failed to add discount");
    } finally {
      setLoading(false);
    }
  };

  // Edit handlers
  const handleEdit = (
    item:
      | IMenuItemFetched
      | IFeaturedItemFetched
      | IPopularItemFetched
      | IDiscountFetched,
    type: "menu" | "featured" | "popular" | "discount"
  ) => {
    setSelectedItem(item);
    let formData: any = {
      isApproved: item.isApproved,
    };
    switch (type) {
      case "menu":
        formData = {
          ...formData,
          name: item.name,
          description: item.description || "",
          price: item.price,
          originalPrice: (item as IMenuItemFetched).originalPrice || "",
          cookTime: (item as IMenuItemFetched).cookTime || "",
          category: item.category,
          restaurantId: item.restaurantId,
          needsTakeawayContainer:
            (item as IMenuItemFetched).needsTakeawayContainer || false,
          extraPortion: (item as IMenuItemFetched).extraPortion || false,
        };
        break;
      case "featured":
        formData = {
          ...formData,
          name: item.name,
          description: item.description || "",
          price: item.price,
          rating: item.rating,
          category: item.category,
          restaurantId: item.restaurantId,
        };
        break;
      case "popular":
        formData = {
          ...formData,
          name: item.name,
          description: item.description || "",
          price: item.price,
          originalPrice: (item as IPopularItemFetched).originalPrice || "",
          rating: item.rating,
          reviewCount: (item as IPopularItemFetched).reviewCount || 0,
          cookingTime: (item as IPopularItemFetched).cookingTime || "",
          isPopular: (item as IPopularItemFetched).isPopular || false,
          discount: (item as IPopularItemFetched).discount || "",
          category: item.category,
          restaurantId: item.restaurantId,
        };
        break;
      case "discount":
        formData = {
          ...formData,
          title: (item as IDiscountFetched).title,
          description: (item as IDiscountFetched).description || "",
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
        };
        break;
      default:
        break;
    }
    setEditFormData(formData);
    // console.log("The form data to be submitted  is :", formData);

    setNewImage(null);
    setShowEditModal(true);
  };
  // NEW: Delete handler - sets the selected item and opens the confirmation modal
  const handleDelete = (
    item:
      | IMenuItemFetched
      | IFeaturedItemFetched
      | IPopularItemFetched
      | IDiscountFetched,
    type: "menu" | "featured" | "popular" | "discount"
  ) => {
    setSelectedItem(item);
    setSubActiveTab(type); // Ensure the sub-tab is set correctly for the delete action
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setIsDeleting(true);
      let action;
      const subType = subActiveTab;
      switch (subType) {
        case "menu":
          action = deleteAsyncMenuItem({
            itemId: selectedItem.$id,
            imageId: (selectedItem as IMenuItemFetched).image,
          });
          break;
        case "featured":
          action = deleteAsyncFeaturedItem({
            itemId: selectedItem.$id,
            imageId: (selectedItem as IFeaturedItemFetched).image,
          });
          break;
        case "popular":
          action = deleteAsyncPopularItem({
            itemId: selectedItem.$id,
            imageId: (selectedItem as IPopularItemFetched).image,
          });
          break;
        case "discount":
          action = deleteAsyncDiscount(selectedItem.$id);
          break;
      }

      if (action) {
        await dispatch(action as any).unwrap();
        setShowDeleteModal(false);
        // Refetch based on sub tab
        switch (subType) {
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
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const getTitle = () => {
    if (activeTab === "account") {
      return "My Restaurants";
    }
    if (activeTab === "edit-menu") {
      return "Manage contents";
    }
    return `Add New ${
      activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("-", " ")
    }`;
  };

  const { menuBucketId, popularBucketId, featuredBucketId, discountBucketId } =
    validateEnv();

  const getBucketId = (
    type: "menu" | "featured" | "popular" | "discount"
  ): string => {
    return type === "menu"
      ? menuBucketId
      : type === "featured"
      ? featuredBucketId
      : type === "discount"
      ? discountBucketId
      : popularBucketId;
  };

  // UPDATED: Improved renderItemCard with better delete button (fixed text, added icon, improved accessibility and hover effects)
  const renderItemCard = (
    item:
      | IMenuItemFetched
      | IPopularItemFetched
      | IFeaturedItemFetched
      | IDiscountFetched,
    type: "menu" | "featured" | "popular" | "discount"
  ) => {
    let displayName =
      item.name || (item as IDiscountFetched).title || "Unnamed";
    let displayDescription = item.description || "No description available.";
    let displayCategory =
      item.category ||
      (type === "discount" ? (item as IDiscountFetched).appliesTo : undefined);
    let displayPrice = item.price;
    if (type === "discount") {
      const discount = item as IDiscountFetched;
      displayPrice = discount.discountedPrice
        ? `₦${discount.discountedPrice}`
        : `-${discount.discountValue}${
            discount.discountType === "percentage" ? "%" : "₦"
          }`;
    }
    return (
      <div className="group flex bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full h-[240px] border border-gray-200 dark:border-gray-700">
        <div className="relative w-64 h-full overflow-hidden flex-shrink-0">
          <Image
            src={fileUrl(getBucketId(type), item.image as string)}
            alt={`${type} item image`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="250px"
          />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-1">
              {displayName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
              {displayDescription}
            </p>
            {displayCategory && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {displayCategory}
              </p>
            )}
            {type === "menu" && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cook Time: {item.cookTime}
              </p>
            )}
            {type === "featured" && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Rating: {item.rating || 0}/5
              </p>
            )}
            {type === "popular" && (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Rating: {item.rating || 0}/5
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reviews: {item.reviewCount}
                </p>
              </>
            )}
            {type === "discount" && (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Valid From: {(item as IDiscountFetched).validFrom}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Valid To: {(item as IDiscountFetched).validTo}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {displayPrice}
            </span>
            <div className="flex space-x-2">
              {/* Edit Button - Improved with icon */}
              <Button
                onClick={() => handleEdit(item, type)}
                aria-label={`Edit ${displayName}`}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 min-w-[70px]"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              {/* Delete Button - Fixed text to "Delete", added icon, improved hover/confirmation prompt */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item, type);
                }}
                aria-label={`Delete ${displayName}`}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-xl font-semibold text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 min-w-[70px]"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredSubTabs = useMemo(() => {
    const allTabs = [
      { id: "menu", label: "Menu Items" },
      { id: "featured", label: "Featured Items" },
      { id: "popular", label: "Popular Items" },
      { id: "discount", label: "Discounts" },
    ];
    if (user?.role === "admin") {
      return allTabs;
    }
    return allTabs.filter((tab) => tab.id === "menu" || tab.id === "discount");
  }, [user?.role]);

  // Show loader while checking access
  if (isCheckingAccess) {
    return <ModernLoader />;
  }
  // Show access restriction if no access
  if (!hasAccess) {
    return <AccessRestriction />;
  }
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <AddItemSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center lg:text-left">
          {getTitle()}
        </h1>
        {activeTab === "account" && (
          <AccountTab
            filteredRestaurants={filteredRestaurants}
            searchCategory={searchCategory}
            setSearchCategory={setSearchCategory}
            setFilteredRestaurants={setFilteredRestaurants}
          />
        )}
        {activeTab === "edit-menu" && (
          <EditMenuTab
            filteredDiscounts={filteredDiscounts}
            filteredMenuItems={filteredMenuItems}
            filteredPopularItems={filteredPopularItems}
            filteredSubTabs={filteredSubTabs}
            setSubActiveTab={setSubActiveTab}
            subActiveTab={subActiveTab}
            renderItemCard={renderItemCard}
            filteredFeaturedItems={filteredFeaturedItems}
          />
        )}
        {activeTab === "menu-item" && (
          <div className="space-y-6">
            <MenuItemForm
              form={menuItemForm}
              restaurants={
                user?.role === "admin" ? restaurants : filteredRestaurants
              }
              onSubmit={handleMenuItemSubmit}
              loading={loading}
              onAddExtras={(selectedExtras) => {
                setMenuSelectedExtras(selectedExtras);
                toast.success(`${selectedExtras.length} extras added!`);
              }}
              onSelectExtra={setSelectedExtraId}
              excludeTypes={[
                "pack",
                "plastic container",
                "take away container",
                "take out pack",
              ]}
            />
          </div>
        )}
        {activeTab === "featured-item" && (
          <div className="space-y-6">
            <FeaturedItemForm
              form={featuredItemForm}
              restaurants={
                user?.role === "admin" ? restaurants : filteredRestaurants
              }
              onSubmit={handleFeaturedItemSubmit}
              loading={loading}
              onAddExtras={(selectedExtras) => {
                setFeaturedSelectedExtras(selectedExtras);
                toast.success(`${selectedExtras.length} extras added!`);
              }}
            />
          </div>
        )}
        {activeTab === "popular-item" && (
          <div className="space-y-6">
            <PopularItemForm
              form={popularItemForm}
              restaurants={
                user?.role === "admin" ? restaurants : filteredRestaurants
              }
              onSubmit={handlePopularItemSubmit}
              loading={loading}
              onAddExtras={(selectedExtras) => {
                setPopularSelectedExtras(selectedExtras);
                toast.success(`${selectedExtras.length} extras added!`);
              }}
            />
          </div>
        )}
        {activeTab === "discount" && (
          <div className="space-y-6">
            <DiscountForm
              form={discountForm}
              targetOptions={targetOptions}
              onSubmit={handleDiscountSubmit}
              loading={loading}
              restaurants={
                user?.role === "admin" ? restaurants : filteredRestaurants
              }
              onAddExtras={(selectedExtras) => {
                setDiscountSelectedExtras(selectedExtras);
                toast.success(`${selectedExtras.length} extras added!`);
              }}
            />
          </div>
        )}
        {activeTab === "extras" && <ExtrasManagementForm />}
      </main>

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <EditItemModal
          item={selectedItem}
          type={subActiveTab}
          dispatch={dispatch}
          onClose={() => setShowEditModal(false)}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          newImage={newImage}
          setNewImage={setNewImage}
          isUpdating={isUpdating}
          setIsUpdating={setIsUpdating}
          restaurantName={restaurantName}
          setRestaurantName={setRestaurantName}
        />
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <DeleteConfirmModal
          confirmDelete={confirmDelete}
          isDeleting={isDeleting}
          selectedItem={selectedItem}
          setShowDeleteModal={setShowDeleteModal}
        />
      )}
    </div>
  );
};

export default AddFoodItemForm;
