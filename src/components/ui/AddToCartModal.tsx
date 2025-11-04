"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  ShoppingCart,
  X,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useShowCart } from "@/context/showCart";
import {
  ICartItemOrder,
  ICartItemFetched,
  IFetchedExtras,
  IPackFetched,
  ISelectedExtra,
} from "../../../types/types";
import {
  createOrderAsync,
  resetOrders,
  addOrder,
  deleteOrder,
  updateOrderAsync,
} from "@/state/orderSlice";
import { AppDispatch, RootState } from "@/state/store";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { databases } from "@/utils/appwrite";
import { Query } from "appwrite";
import { useAuth } from "@/context/authContext";

const AddToCartModal = () => {
  const { isOpen, setIsOpen, item } = useShowCart();
  const dispatch = useDispatch<AppDispatch>();
  const error = useSelector((state: RootState) => state.orders.error);
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [extraQuantities, setExtraQuantities] = useState<
    Record<string, number>
  >({});
  const [allExtras, setAllExtras] = useState<(IFetchedExtras | IPackFetched)[]>(
    []
  );
  const [extrasLoading, setExtrasLoading] = useState<
    "idle" | "pending" | "succeeded" | "failed"
  >("idle");
  const [extrasError, setExtrasError] = useState<string | null>(null);
  const maxInstructionsLength = 200;
  const { user } = useAuth();
  const userId = user?.userId;


  const isDiscountItem = item.category === "discount";
  const minOrderValue = item.minOrderValue || 0;
  const isValidQuantity = !isDiscountItem || quantity >= minOrderValue;
  // Regex to identify packaging/packs (e.g., containers or packs)
  const packagingRegex = /(container|pack)/i;

  // Fetch extras and packs using item.extras IDs
  useEffect(() => {
    if (isOpen && Array.isArray(item.extras) && item.extras.length > 0) {
      const fetchAllExtrasAndPacks = async () => {
        setExtrasLoading("pending");
        setExtrasError(null);
        try {
          const { databaseId, extrasCollectionId, packsCollectionId } =
            validateEnv();

          // First, fetch from extras collection
          let extrasResponse = await databases.listDocuments(
            databaseId,
            extrasCollectionId,
            [Query.equal("$id", item.extras as string[])]
          );
          let fetchedExtras: IFetchedExtras[] =
            extrasResponse.documents as IFetchedExtras[];

          // Then, fetch from packs collection for any pack IDs
          let packsResponse = await databases.listDocuments(
            databaseId,
            packsCollectionId,
            [Query.equal("$id", item.extras as string[])]
          );
          let fetchedPacks: IPackFetched[] =
            packsResponse.documents as IPackFetched[];

          // Combine them
          const combined = [...fetchedExtras, ...fetchedPacks];
          setAllExtras(combined);
          setExtrasLoading("succeeded");
        } catch (error) {
          const errorMsg =
            error instanceof Error
              ? error.message
              : "Failed to fetch extras and packs";
          setExtrasError(errorMsg);
          setExtrasLoading("failed");
          toast.error(errorMsg);
        }
      };
      fetchAllExtrasAndPacks();
    } else {
      setAllExtras([]);
      setExtraQuantities({});
    }
  }, [isOpen, item.extras]);

  // Initialize extra quantities: auto-set packaging/packs to item quantity, optional to 0
  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    allExtras.forEach((extraOrPack) => {
      if (packagingRegex.test(extraOrPack.name)) {
        initialQuantities[extraOrPack.$id] = quantity; // Auto-set packaging/packs to item quantity
      } else {
        initialQuantities[extraOrPack.$id] = 0; // Optional extras start at 0
      }
    });
    setExtraQuantities(initialQuantities);
  }, [allExtras, quantity]);

  // Update packaging quantities when item quantity changes
  useEffect(() => {
    setExtraQuantities((prev) => {
      const updated = { ...prev };
      allExtras.forEach((extraOrPack) => {
        if (packagingRegex.test(extraOrPack.name)) {
          updated[extraOrPack.$id] = quantity;
        }
      });
      return updated;
    });
  }, [quantity, allExtras]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuantity(item.quantity || 1);
      setSpecialInstructions("");
      setExtraQuantities({});
      setAllExtras([]);
      setExtrasLoading("idle");
      setExtrasError(null);
      if (error) {
        dispatch(resetOrders());
      }
    }
  }, [isOpen, item.quantity, dispatch, error]);

  // Categorize extras and packs
  const packagingExtras = useMemo(() => {
    return allExtras.filter((extraOrPack) =>
      packagingRegex.test(extraOrPack.name)
    );
  }, [allExtras]);

  const optionalExtras = useMemo(() => {
    return allExtras.filter(
      (extraOrPack) => !packagingRegex.test(extraOrPack.name)
    );
  }, [allExtras]);

  // Calculate extras total
  const extrasTotal = useMemo(() => {
    let total = 0;
    allExtras.forEach((extraOrPack) => {
      const qty = extraQuantities[extraOrPack.$id] || 0;
      const price =
        typeof extraOrPack.price === "string"
          ? parseFloat(extraOrPack.price)
          : extraOrPack.price;
      total += price * qty;
    });
    return total;
  }, [extraQuantities, allExtras]);

  const parsePrice = (priceString: string | number): number => {
    return typeof priceString === "string"
      ? Number(priceString.replace(/[₦,]/g, ""))
      : priceString;
  };

  const itemPrice = parsePrice(item.price);
  const subtotal = itemPrice * quantity;
  const totalPrice = subtotal + extrasTotal;

  const handleExtraQuantityChange = (extraId: string, delta: number) => {
    setExtraQuantities((prev) => {
      const current = prev[extraId] || 0;
      return { ...prev, [extraId]: Math.max(0, current + delta) };
    });
  };

  const handleAddToCart = async () => {
    if (isDiscountItem && quantity < minOrderValue) {
      toast.error(
        `Minimum order quantity for this discount: ${minOrderValue}`,
        {
          duration: 4000,
          position: "top-right",
        }
      );
      return;
    }

    const newSelectedExtras: ISelectedExtra[] = [];
    allExtras.forEach((extraOrPack) => {
      const qty = extraQuantities[extraOrPack.$id] || 0;
      if (qty > 0) {
        newSelectedExtras.push({ extraId: extraOrPack.$id, quantity: qty });
      }
    });
    
    const stringifiedNewSelectedExtras = newSelectedExtras.map((e) =>
      JSON.stringify(e)
    );

    const existingOrder = orders?.find(
      (order) => order.itemId === item.itemId && order.userId === item.userId
    );

    if (existingOrder) {
      // Parse existing selectedExtras
      const existingExtrasMap = new Map<string, number>();
      (existingOrder.selectedExtras || []).forEach(
        (extraStr: ISelectedExtra | string) => {
          try {
            const e: ISelectedExtra = JSON.parse(extraStr as string);
            existingExtrasMap.set(e.extraId, e.quantity);
          } catch (e) {
            console.error("Failed to parse existing extra:", extraStr, e);
          }
        }
      );

      // Merge with new extras
      newSelectedExtras.forEach((newE) => {
        const curr = existingExtrasMap.get(newE.extraId) || 0;
        existingExtrasMap.set(newE.extraId, curr + newE.quantity);
      });

      const mergedExtras: ISelectedExtra[] = Array.from(
        existingExtrasMap.entries()
      ).map(([extraId, qty]) => ({ extraId, quantity: qty }));

      const stringifiedMergedExtras = mergedExtras.map((e) =>
        JSON.stringify(e)
      );

      const newQuantity = existingOrder.quantity + quantity;
      const newSubtotal = itemPrice * newQuantity;
      let newExtrasTotal = 0;
      mergedExtras.forEach((e) => {
        const extraOrPack = allExtras.find((ex) => ex.$id === e.extraId);
        if (extraOrPack) {
          const price =
            typeof extraOrPack.price === "string"
              ? parseFloat(extraOrPack.price)
              : extraOrPack.price;
          newExtrasTotal += price * e.quantity;
        }
      });
      const newTotalPrice = newSubtotal + newExtrasTotal;

      // Optimistic update
      dispatch(
        addOrder({
          ...existingOrder,
          quantity: newQuantity,
          totalPrice: newTotalPrice,
          specialInstructions:
            specialInstructions || existingOrder.specialInstructions,
          selectedExtras: stringifiedMergedExtras,
        })
      );
      toast.success(`${item.name} quantity updated in cart!`, {
        duration: 3000,
        position: "top-right",
      });

      try {
        await dispatch(
          updateOrderAsync({
            orderId: existingOrder.$id,
            orderData: {
              quantity: newQuantity,
              totalPrice: newTotalPrice,
              specialInstructions:
                specialInstructions || existingOrder.specialInstructions,
              selectedExtras: stringifiedMergedExtras,
            },
          })
        ).unwrap();
        setIsOpen(false);
      } catch (err) {
        toast.error(`Failed to update ${item.name} in cart`, {
          duration: 4000,
          position: "top-right",
        });
        dispatch(
          addOrder({
            ...existingOrder,
            quantity: existingOrder.quantity,
            totalPrice: existingOrder.totalPrice,
            specialInstructions: existingOrder.specialInstructions,
            selectedExtras: existingOrder.selectedExtras || [],
          })
        );
      }
    } else {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const newItem: ICartItemFetched = {
        $id: tempId,
        userId: userId,
        itemId: item.itemId,
        image: item.image,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity,
        totalPrice: Number(totalPrice),
        restaurantId: item.restaurantId,
        specialInstructions,
        status: "pending",
        source: item.source,
        selectedExtras: stringifiedNewSelectedExtras,
        minOrderValue: item.source === "discount" ? item.minOrderValue : null,
      } as unknown as ICartItemFetched;

      dispatch(addOrder(newItem));
      toast.success(`${newItem.name} added to cart!`, {
        duration: 3000,
        position: "top-right",
      });

      try {
        const { $id, ...orderData } = newItem;
        await dispatch(
          createOrderAsync({
            ...orderData,
            $id: tempId,
            source: item.source,
          } as ICartItemOrder)
        ).unwrap();
        setIsOpen(false);
      } catch (err) {
        toast.error(`Failed to add ${newItem.name} to cart`, {
          duration: 4000,
          position: "top-right",
        });
        dispatch(deleteOrder(tempId));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn(
          "sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] bg-white dark:bg-gray-900 border-0 p-0 overflow-y-auto rounded-3xl shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-300",
          "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
        aria-describedby="dialog-description"
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 group"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
        </button>

        <DialogHeader className="sr-only">
          <DialogTitle>Add {item.name} to Cart</DialogTitle>
          <DialogDescription id="dialog-description">
            Customize your order for {item.name}. Adjust quantity and add
            special instructions.
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-48 sm:h-64 bg-gradient-to-br from-orange-100 via-orange-50 to-red-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 overflow-hidden flex-shrink-0">
          <Image
            src={fileUrl(
              item.source === "featured"
                ? validateEnv().featuredBucketId
                : item.source === "popular"
                ? validateEnv().popularBucketId
                : item.source === "discount"
                ? validateEnv().discountBucketId
                : item.source === "offer"
                ? validateEnv().promoOfferBucketId
                : validateEnv().menuBucketId,
              item.image
            )}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            quality={90}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 z-10">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border",
                item.category === "veg"
                  ? "bg-green-500/90 text-white border-green-400"
                  : "bg-orange-500/90 text-white border-orange-400"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {item.category === "veg" ? "Vegetarian" : "Non-Vegetarian"}
            </span>
          </div>
          {item.category === "discount" &&
            item.discountType &&
            item.discountValue !== undefined && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/90 text-white border border-red-400 shadow-lg backdrop-blur-sm">
                  {item.discountType === "percentage"
                    ? `${item.discountValue}%`
                    : `₦${item.discountValue}`}{" "}
                  Off
                </span>
              </div>
            )}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 drop-shadow-lg line-clamp-1">
              {item.name === "Jollof" ? "African Jollof" : item.name}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 line-clamp-2 mb-2 drop-shadow">
              {item.description || "Delicious and freshly prepared item."}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold">
                  ₦{itemPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                Quantity
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Select amount
              </span>
            </div>
            <div className="flex items-center justify-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className={cn(
                  "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 touch-manipulation",
                  quantity <= 1
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl active:scale-95"
                )}
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center min-w-[60px]">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {quantity}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {quantity === 1 ? "item" : "items"}
                </span>
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 touch-manipulation"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {!isValidQuantity && (
              <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Minimum order quantity for this discount: {minOrderValue}
                  </span>
                </div>
              </div>
            )}
          </div>

          {packagingExtras.length > 0 && (
            <div>
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                  Takeout Container
                </h3>
              </div>
              <div className="space-y-3">
                {packagingExtras.map((extraOrPack) => {
                  const qty = extraQuantities[extraOrPack.$id] || 0;
                  const extraPrice =
                    typeof extraOrPack.price === "string"
                      ? parseFloat(extraOrPack.price)
                      : extraOrPack.price;
                  return (
                    <div
                      key={extraOrPack.$id}
                      className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-orange-500 dark:border-orange-600 bg-white dark:bg-gray-800 shadow-sm"
                    >
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full border-2 border-orange-500 dark:border-orange-600 bg-orange-500 dark:bg-orange-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                          Pack
                        </p>
                        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 leading-tight">
                          ₦{extraPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {optionalExtras.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                  Optional Extras
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Customize your order
                </span>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {optionalExtras.map((extraOrPack) => {
                  const qty = extraQuantities[extraOrPack.$id] || 0;
                  const extraPrice =
                    typeof extraOrPack.price === "string"
                      ? parseFloat(extraOrPack.price)
                      : extraOrPack.price;
                  return (
                    <div
                      key={extraOrPack.$id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200",
                        qty > 0
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {"image" in extraOrPack && extraOrPack.image ? (
                          <Image
                            src={fileUrl(
                              validateEnv().extrasBucketId,
                              extraOrPack.image
                            )}
                            fill
                            alt={extraOrPack.name}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <span className="text-xs text-gray-500">?</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {extraOrPack.name}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {"description" in extraOrPack
                            ? extraOrPack.description || "Popular add-on"
                            : "Popular add-on"}
                        </p>
                        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          ₦{extraPrice.toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleExtraQuantityChange(extraOrPack.$id, -1)
                          }
                          disabled={qty <= 0}
                          className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-md transition-all",
                            qty <= 0
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                          )}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                          {qty}
                        </span>
                        <button
                          onClick={() =>
                            handleExtraQuantityChange(extraOrPack.$id, 1)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                Special Instructions
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                Optional
              </span>
            </div>
            <div className="relative">
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="E.g., extra spicy, no onions, well done..."
                maxLength={maxInstructionsLength}
                className="w-full min-h-[80px] resize-none bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl p-3 text-gray-900 dark:text-gray-100 text-sm transition-all duration-200"
              />
              <div className="absolute bottom-2 right-2">
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full transition-colors",
                    specialInstructions.length > maxInstructionsLength * 0.8
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}
                >
                  {specialInstructions.length}/{maxInstructionsLength}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-3 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Subtotal ({quantity})
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                ₦{subtotal.toLocaleString()}
              </span>
            </div>
            {extrasTotal > 0 && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Extras & Packaging
                </span>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  ₦{extrasTotal.toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t border-orange-200 dark:border-orange-800 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  ₦{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!isValidQuantity || extrasLoading === "pending"}
            className={cn(
              "w-full py-4 text-base font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl active:scale-95 touch-manipulation group disabled:opacity-50 disabled:cursor-not-allowed",
              item.category === "veg"
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                : "bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white"
            )}
            aria-label={`Add ${item.name} to cart`}
          >
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
              <span>Add to Cart</span>
              <span className="opacity-75">•</span>
              <span className="font-extrabold">
                ₦{totalPrice.toLocaleString()}
              </span>
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartModal;
