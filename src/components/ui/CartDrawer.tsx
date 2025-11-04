"use client";
import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Plus,
  Minus,
  Loader2,
  Trash2,
  ShoppingCart,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Package,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import { cn } from "@/lib/utils";
import { useShowCart } from "@/context/showCart";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import {
  fetchOrdersByUserIdAsync,
  updateOrderAsync,
  deleteOrderAsync,
  updateQuantity,
  deleteOrder,
  addOrder,
} from "@/state/orderSlice";
import {
  ICartItemFetched,
  IFetchedExtras,
  IPackFetched,
  ISelectedExtra,
} from "../../../types/types";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { useAuth } from "@/context/authContext";
import { databases } from "@/utils/appwrite";
import { Query } from "appwrite";

const CartDrawer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading, orders } = useSelector(
    (state: RootState) => state.orders
  );
  const { activeCart, setActiveCart } = useShowCart();
  const { user } = useAuth();
  const [showEmptyCartDialog, setShowEmptyCartDialog] = useState(false);
  const [showMinAmountDialog, setShowMinAmountDialog] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [extrasCache, setExtrasCache] = useState<
    Record<string, IFetchedExtras | IPackFetched>
  >({});
  const router = useRouter();
  const pathname = usePathname();

  const MIN_ORDER_AMOUNT = 1000;

  const spoonRegex =
    /(rice|egg sauce|beans|porridge|pasta|spaghetti|macaroni|stew|pizza|jollof|fried rice|white rice|yam pottage|asaro)/i;
  const soupRegex =
    /(soup|egusi|ogbono|okra|efo|ewedu|gbegiri|banga|afang|pepper soup)/i;
  // Broader regex to match AddToCartModal
  const packagingRegex = /(container|pack|takeout|takeaway|plastic|box|bag)/i;

  useEffect(() => {
    if (user?.userId && !orders && !loading) {
      dispatch(fetchOrdersByUserIdAsync(user.userId))
        .unwrap()
        .catch((err) => {
          toast.error(err || "Failed to fetch orders", {
            duration: 4000,
            position: "top-right",
          });
        });
    }
  }, [dispatch, user, orders, loading]);

  useEffect(() => {
    const fetchExtrasAndPacks = async () => {
      if (!orders || orders.length === 0) return;

      const allExtraIds = new Set<string>();
      orders.forEach((order) => {
        if (order.selectedExtras && Array.isArray(order.selectedExtras)) {
          order.selectedExtras.forEach((extraStr: ISelectedExtra | string) => {
            try {
              const extraObj = JSON.parse(extraStr as string);
              allExtraIds.add(extraObj.extraId);
            } catch (e) {
              console.error("Failed to parse extra:", extraStr, e);
            }
          });
        }
      });

      const extraIdsToFetch = Array.from(allExtraIds).filter(
        (id) => !extrasCache[id]
      );

      if (extraIdsToFetch.length === 0) return;

      try {
        const { databaseId, extrasCollectionId, packsCollectionId } =
          validateEnv();

        // Fetch from extras collection
        const extrasResponse = await databases.listDocuments(
          databaseId,
          extrasCollectionId,
          [Query.equal("$id", extraIdsToFetch)]
        );
        const fetchedExtras: IFetchedExtras[] =
          extrasResponse.documents as IFetchedExtras[];

        // Fetch from packs collection
        const packsResponse = await databases.listDocuments(
          databaseId,
          packsCollectionId,
          [Query.equal("$id", extraIdsToFetch)]
        );
        const fetchedPacks: IPackFetched[] =
          packsResponse.documents as IPackFetched[];

        // Combine them
        const newExtrasAndPacks: Record<string, IFetchedExtras | IPackFetched> =
          {};
        [...fetchedExtras, ...fetchedPacks].forEach((doc) => {
          newExtrasAndPacks[doc.$id] = doc;
        });

        setExtrasCache((prev) => ({ ...prev, ...newExtrasAndPacks }));
      } catch (error) {
        console.error("Failed to fetch extras and packs:", error);
      }
    };

    fetchExtrasAndPacks();
  }, [orders, extrasCache]);

  useEffect(() => {
    if (!loading && (!orders || orders.length === 0) && activeCart) {
      setShowEmptyCartDialog(true);
    } else {
      setShowEmptyCartDialog(false);
    }
  }, [orders, loading, activeCart]);

  const calculateNewTotalPrice = useCallback(
    (order: ICartItemFetched, newQuantity: number): number => {
      const parsePrice = (priceString: string | number): number => {
        return typeof priceString === "string"
          ? Number(priceString.replace(/[₦,]/g, ""))
          : priceString;
      };

      const itemPrice = parsePrice(order.price);
      const itemName = order.name || "";
      const requiresPlastic =
        spoonRegex.test(itemName) || soupRegex.test(itemName);

      const newSubtotal = itemPrice * newQuantity;

      let extrasTotal = 0;

      if (order.selectedExtras && Array.isArray(order.selectedExtras)) {
        order.selectedExtras.forEach((extraStr: ISelectedExtra | string) => {
          try {
            const extraObj = JSON.parse(extraStr as string);
            const extra = extrasCache[extraObj.extraId];
            if (extra) {
              const isPackaging =
                packagingRegex.test(extra.name) ||
                (requiresPlastic &&
                  extra.name.toLowerCase().includes("plastic container"));
              const effectiveQty = isPackaging
                ? newQuantity
                : extraObj.quantity;
              extrasTotal += parseFloat(extra.price as string) * effectiveQty;
            }
          } catch (e) {
            console.error(
              "Failed to parse extra for total calculation:",
              extraStr,
              e
            );
          }
        });
      }

      return newSubtotal + extrasTotal;
    },
    [extrasCache, spoonRegex, soupRegex, packagingRegex]
  );

  const handleUpdateQuantity = useCallback(
    debounce(async (order: ICartItemFetched, change: number) => {
      const isDiscountItem = order.source === "discount";
      const minOrderValue = order.minOrderValue || 0;
      const newQuantity = Math.max(0, order.quantity + change);

      if (isDiscountItem && newQuantity > 0 && newQuantity < minOrderValue) {
        toast.error(
          `Quantity cannot be less than minimum order value of ${minOrderValue} for this discounted item`,
          {
            duration: 4000,
            position: "top-right",
          }
        );
        return;
      }

      // Optimistic update
      dispatch(updateQuantity({ orderId: order.$id, change }));

      const newTotalPrice = calculateNewTotalPrice(order, newQuantity);

      // Update selectedExtras quantities for packaging items
      let updatedSelectedExtras: ISelectedExtra[] = [];
      if (order.selectedExtras && Array.isArray(order.selectedExtras)) {
        updatedSelectedExtras = order.selectedExtras
          .map((extraStr: ISelectedExtra | string) => {
            try {
              return JSON.parse(extraStr as string);
            } catch (e) {
              console.error("Failed to parse extra:", extraStr, e);
              return null;
            }
          })
          .filter((e): e is ISelectedExtra => e !== null);
      }

      if (newQuantity > 0) {
        updatedSelectedExtras = updatedSelectedExtras.map((extraObj) => {
          const extra = extrasCache[extraObj.extraId];
          if (extra) {
            const isPackaging =
              packagingRegex.test(extra.name) ||
              spoonRegex.test(order.name) ||
              soupRegex.test(order.name);
            return {
              ...extraObj,
              quantity: isPackaging ? newQuantity : extraObj.quantity,
            };
          }
          return extraObj;
        });
      }

      const stringifiedSelectedExtras = updatedSelectedExtras.map((e) =>
        JSON.stringify(e)
      );

      if (newQuantity === 0) {
        setDeletingItems((prev) => new Set(prev).add(order.$id));
        try {
          await dispatch(deleteOrderAsync(order.$id)).unwrap();
          toast.success("Item removed from cart");
        } catch (err) {
          toast.error("Failed to remove item");
          dispatch(updateQuantity({ orderId: order.$id, change: -change }));
        } finally {
          setDeletingItems((prev) => {
            const next = new Set(prev);
            next.delete(order.$id);
            return next;
          });
        }
      } else {
        try {
          await dispatch(
            updateOrderAsync({
              orderId: order.$id,
              orderData: {
                quantity: newQuantity,
                totalPrice: newTotalPrice,
                selectedExtras: stringifiedSelectedExtras,
              },
            })
          ).unwrap();
        } catch (err) {
          toast.error("Failed to update quantity");
          dispatch(updateQuantity({ orderId: order.$id, change: -change }));
        }
      }
    }, 300),
    [
      dispatch,
      calculateNewTotalPrice,
      extrasCache,
      spoonRegex,
      soupRegex,
      packagingRegex,
    ]
  );

  const handleDeleteOrder = useCallback(
    async (order: ICartItemFetched) => {
      setDeletingItems((prev) => new Set(prev).add(order.$id));
      dispatch(deleteOrder(order.$id));

      try {
        await dispatch(deleteOrderAsync(order.$id)).unwrap();
        toast.success("Item removed from cart");
      } catch (err) {
        toast.error("Failed to delete item");
        dispatch(addOrder(order));
      } finally {
        setDeletingItems((prev) => {
          const next = new Set(prev);
          next.delete(order.$id);
          return next;
        });
      }
    },
    [dispatch]
  );

  const subtotal = useMemo(
    () => orders?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0,
    [orders]
  );

  const hasActiveOrder =
    Array.isArray(orders) &&
    orders.some((order) => ["pending", "processing"].includes(order.status));

  const itemCount = orders?.length || 0;

  const getItemExtras = (order: ICartItemFetched) => {
    if (!order.selectedExtras || !Array.isArray(order.selectedExtras))
      return [];
    return order.selectedExtras
      .map((extraStr: ISelectedExtra | string) => {
        try {
          const extraObj = JSON.parse(extraStr as string);
          const extra = extrasCache[extraObj.extraId];
          return extra ? { ...extra, quantity: extraObj.quantity } : null;
        } catch (e) {
          console.error("Failed to parse extra for display:", extraStr, e);
          return null;
        }
      })
      .filter(Boolean) as (IFetchedExtras & { quantity: number })[];
  };

  const getPackagingExtras = useCallback(
    (itemExtras: (IFetchedExtras & { quantity: number })[]) => {
      return itemExtras.filter(
        (extra) =>
          packagingRegex.test(extra.name) ||
          ((spoonRegex.test(extra.name) || soupRegex.test(extra.name)) &&
            extra.name.toLowerCase().includes("plastic container"))
      );
    },
    [packagingRegex, spoonRegex, soupRegex]
  );

  const getOptionalExtras = useCallback(
    (itemExtras: (IFetchedExtras & { quantity: number })[]) => {
      return itemExtras.filter(
        (extra) =>
          !packagingRegex.test(extra.name) &&
          !(
            (spoonRegex.test(extra.name) || soupRegex.test(extra.name)) &&
            extra.name.toLowerCase().includes("plastic container")
          )
      );
    },
    [packagingRegex, spoonRegex, soupRegex]
  );

  const restrictedPaths = ["/checkout"];

  const handleCheckout = () => {
    if (subtotal < MIN_ORDER_AMOUNT) {
      setShowMinAmountDialog(true);
      return;
    }
    setActiveCart(false);
    router.push("/checkout");
  };

  return (
    <>
      {hasActiveOrder &&
        !restrictedPaths.some((path) => pathname.includes(path)) && (
          <button
            onClick={() => setActiveCart(true)}
            className={`fixed bottom-6 right-6 z-50 group hidden md:block`}
            aria-label="View cart"
          >
            <div className="relative bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white animate-pulse">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              View Cart ({itemCount})
            </span>
          </button>
        )}

      <Drawer open={activeCart} onOpenChange={setActiveCart}>
        <DrawerContent className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-t-3xl max-w-md mx-auto h-[85vh] flex flex-col border-t-4 border-orange-500">
          <DrawerHeader className="relative border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                My Cart
              </DrawerTitle>
            </div>
            <DrawerDescription className="text-sm text-gray-600 dark:text-gray-400">
              {itemCount} {itemCount === 1 ? "item" : "items"} ready for
              checkout
            </DrawerDescription>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Delivery Available
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loading && !orders?.length ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="animate-spin h-10 w-10 text-orange-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Loading your cart...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <p
                  className="text-red-500 text-center font-medium"
                  role="alert"
                >
                  {error}
                </p>
              </div>
            ) : orders && orders.length > 0 ? (
              orders.map((order) => {
                const isDeleting = deletingItems.has(order.$id);
                const itemExtras = getItemExtras(order);
                const packagingExtras = getPackagingExtras(itemExtras);
                const optionalExtras = getOptionalExtras(itemExtras);
                const isDiscountItem = order.source === "discount";
                const minOrderValue = order.minOrderValue || 0;

                return (
                  <div
                    key={order.$id}
                    className={cn(
                      "bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700",
                      isDeleting && "opacity-50 scale-95"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        <Image
                          src={fileUrl(
                            order.source === "featured"
                              ? validateEnv().featuredBucketId
                              : order.source === "popular"
                              ? validateEnv().popularBucketId
                              : order.source === "discount"
                              ? validateEnv().discountBucketId
                              : order.source === "offer"
                              ? validateEnv().promoOfferBucketId
                              : validateEnv().menuBucketId,
                            order.image
                          )}
                          alt={order.name || "Item"}
                          className="w-full h-full object-cover"
                          width={96}
                          height={96}
                          quality={90}
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-base truncate">
                          {order.name || "Unknown Item"}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Unit Price:</span> ₦
                            {(typeof order.price === "string"
                              ? Number(order.price.replace(/[₦,]/g, ""))
                              : order.price
                            ).toLocaleString()}
                          </p>

                          {packagingExtras.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {packagingExtras.map((extra) => (
                                <span
                                  key={extra.$id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-800"
                                >
                                  <CheckCircle className="w-2.5 h-2.5" />
                                  {extra.name} x{extra.quantity}
                                </span>
                              ))}
                            </div>
                          )}

                          {optionalExtras.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {optionalExtras.map((extra) => (
                                <span
                                  key={extra.$id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  {extra.name} x{extra.quantity}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                            ₦{order.totalPrice.toLocaleString()}
                          </p>
                        </div>
                        {order.specialInstructions && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic line-clamp-2">
                            "{order.specialInstructions}"
                          </p>
                        )}
                        {isDiscountItem && order.quantity < minOrderValue && (
                          <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-orange-800 dark:text-orange-300">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <span>
                                Minimum order quantity: {minOrderValue}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(order, -1)}
                            className="w-8 h-8 rounded-full hover:bg-white dark:hover:bg-gray-600"
                            disabled={loading || isDeleting}
                            aria-label={`Decrease quantity of ${order.name}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-bold text-gray-900 dark:text-gray-100 text-sm">
                            {order.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(order, 1)}
                            className="w-8 h-8 rounded-full hover:bg-white dark:hover:bg-gray-600"
                            disabled={loading || isDeleting}
                            aria-label={`Increase quantity of ${order.name}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteOrder(order)}
                          className="w-full h-8 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
                          disabled={loading || isDeleting}
                          aria-label={`Delete ${order.name} from cart`}
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : null}
          </div>

          <DrawerFooter className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-300 dark:border-gray-500">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              className={cn(
                "w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl",
                "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white",
                "flex items-center justify-center gap-3 group",
                isCheckingOut && "opacity-50 cursor-not-allowed"
              )}
              disabled={!orders || orders.length === 0 || isCheckingOut}
              aria-label="Proceed to checkout"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={showEmptyCartDialog} onOpenChange={setShowEmptyCartDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-orange-500" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              Your Cart is Empty
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Looks like you haven't added anything yet. Start exploring our
              delicious menu!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEmptyCartDialog(false);
                setActiveCart(false);
              }}
              className="h-12 px-6 rounded-xl"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowEmptyCartDialog(false);
                setActiveCart(false);
                router.push("/menu");
              }}
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMinAmountDialog} onOpenChange={setShowMinAmountDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              Minimum Order Amount Required
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Your current order total is <b>₦{subtotal.toLocaleString()}.</b>{" "}
              The minimum order amount is{" "}
              <b>₦{MIN_ORDER_AMOUNT.toLocaleString()}.</b> Please add more items
              to your cart to proceed with checkout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowMinAmountDialog(false);
              }}
              className="h-12 px-6 rounded-xl"
            >
              Continue Shopping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CartDrawer;
