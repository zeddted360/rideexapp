"use client";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit2,
  Loader2,
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Image as ImageIcon,
  Info,
  Sparkles,
  DollarSign,
  Upload,
} from "lucide-react";
import FileInput from "@/components/FileInput";
import { AppDispatch, RootState } from "@/state/store";
import {
  createAsyncExtra,
  listAsyncExtras,
  updateAsyncExtra,
  deleteAsyncExtra,
  checkAndCreateDefaultPacks,
  listAsyncPacks,
  updateAsyncPack,
} from "@/state/extraSlice";
import toast from "react-hot-toast";
import { IFetchedExtras, IPackFetched } from "../../../types/types";
import { useAuth } from "@/context/authContext";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { ChangeEvent } from "react";

const extraSchema = z.object({
  name: z.string().min(1, "Extra name is required"),
  price: z.string().min(1, "Extra price is required"),
  description: z.string(),
  image: z.any().optional(),
  vendorId: z.string(),
});

type ExtraFormData = z.infer<typeof extraSchema>;

const ITEMS_PER_PAGE = 4;

const ExtrasManagementForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { extras, packs, loading, error } = useSelector(
    (state: RootState) => state.extra
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"extra" | "pack" | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { userId: vendorId } = useAuth();
  const initialized = useRef(false);

  const form = useForm<ExtraFormData>({
    resolver: zodResolver(extraSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      image: undefined,
      vendorId: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (vendorId && !initialized.current) {
      initialized.current = true;
      dispatch(checkAndCreateDefaultPacks(vendorId)).then(() => {
        dispatch(listAsyncPacks(vendorId));
      });
      dispatch(listAsyncExtras(vendorId));
    }
  }, [dispatch, vendorId]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const getFieldError = (fieldName: keyof ExtraFormData) => {
    return form.formState.errors[fieldName];
  };

  const isFieldTouched = (fieldName: keyof ExtraFormData) => {
    return form.formState.touchedFields[fieldName];
  };

  const handleSubmit = async (data: ExtraFormData) => {
    setIsSubmitting(true);
    try {
      if (!vendorId || typeof vendorId !== "string") {
        toast.error("Vendor ID is missing. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      const imageFile =
        data.image && (data.image as FileList).length > 0
          ? (data.image as FileList)[0]
          : undefined;
      if (editingId) {
        if (editingType === "pack") {
          await dispatch(
            updateAsyncPack({
              packId: editingId,
              data: { price: parseFloat(data.price) },
            })
          ).unwrap();
          toast.success("Pack price updated successfully!");
          setEditingId(null);
          setEditingType(null);
          setIsFormCollapsed(true);
        } else {
          await dispatch(
            updateAsyncExtra({
              extraId: editingId,
              data: {
                name: data.name,
                price: data.price,
                description: data.description,
                vendorId,
              },
              newImage: imageFile,
            })
          ).unwrap();
          toast.success("Extra updated successfully!");
          setEditingId(null);
          setEditingType(null);
          setIsFormCollapsed(true);
        }
      } else {
        await dispatch(
          createAsyncExtra({
            name: data.name,
            price: data.price,
            description: data.description,
            vendorId,
            image: imageFile,
          })
        ).unwrap();
        toast.success("Extra added successfully!");
        setIsFormCollapsed(true);
      }
      form.reset();
      clearImage();
    } catch (err) {
      toast.error("Failed to save extra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (
    item: IFetchedExtras | IPackFetched,
    type: "extra" | "pack"
  ) => {
    setEditingId(item.$id);
    setEditingType(type);
    setIsFormCollapsed(false);
    if (type === "pack") {
      const pack = item as IPackFetched;
      form.setValue("name", pack.name);
      form.setValue("price", pack.price.toString());
      form.setValue("description", "");
      form.setValue("image", undefined);
      setImagePreview(null);
    } else {
      const extra = item as IFetchedExtras;
      form.setValue("name", extra.name);
      form.setValue("price", extra.price);
      form.setValue("description", extra.description || "");
      setImagePreview(null); // Clear preview on edit
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (extraId: string, imageId?: string) => {
    if (!confirm("Are you sure you want to delete this extra?")) return;

    try {
      await dispatch(deleteAsyncExtra({ extraId, imageId })).unwrap();
      toast.success("Extra deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete extra");
    }
  };

  const handleCancel = () => {
    form.reset();
    setEditingId(null);
    setEditingType(null);
    clearImage();
    if (extras.length > 0) {
      setIsFormCollapsed(true);
    }
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, extras.length));
  };

  const handleShowLess = () => {
    setVisibleCount(ITEMS_PER_PAGE);
    document
      .getElementById("extras-list")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const visibleExtras = extras.slice(0, visibleCount);
  const hasMore = visibleCount < extras.length;
  const canShowLess = visibleCount > ITEMS_PER_PAGE;

  const renderItemCard = (
    item: IFetchedExtras | IPackFetched,
    type: "extra" | "pack"
  ) => {
    const isPack = type === "pack";
    const name = item.name;
    const price = isPack
      ? (item as IPackFetched).price
      : parseFloat((item as IFetchedExtras).price);
    const description = isPack
      ? undefined
      : (item as IFetchedExtras).description;
    const image = isPack ? undefined : (item as IFetchedExtras).image;

    return (
      <Card
        key={item.$id}
        className="bg-white/80 dark:bg-gray-900/80 shadow-md rounded-xl border-0 overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
      >
        <CardContent className="p-4 pt-0">
          {!isPack && (
            <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden mb-3">
              {image ? (
                <Image
                  src={fileUrl(validateEnv().extrasBucketId, image)}
                  fill
                  alt={name}
                  className="object-cover"
                  sizes="(max-width: 762px) 33vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          )}
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1 text-base">
            {name}
          </h4>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-2">
            ₦{price.toLocaleString()}
          </p>
          {!isPack && description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
              {description}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(item, type)}
              className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            {!isPack && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleDelete(item.$id, (item as IFetchedExtras).image)
                }
                className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="w-full bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-2xl border-0 py-4">
        <CardHeader
          className="flex flex-row items-center justify-between pb-2 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
          onClick={() => setIsFormCollapsed(!isFormCollapsed)}
        >
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 p-2 rounded-full">
              <PlusCircle className="w-6 h-6 text-orange-500 fill-orange-500" />
            </span>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {editingId ? "Edit Extra" : "Add New Extra"}
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Customize your menu with add-ons like sauces or sides
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            type="button"
          >
            {isFormCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            )}
          </Button>
        </CardHeader>

        {!isFormCollapsed && (
          <CardContent className="pt-4">
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
              aria-busy={isSubmitting}
            >
              {/* Extra Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Extra Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div className="md:col-span-2">
                    <Label htmlFor="name" className="flex items-center gap-1">
                      Extra Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="e.g. Plastic Container"
                      className={`h-12 mt-1.5 transition-all ${
                        getFieldError("name")
                          ? "border-red-500 focus:ring-red-500"
                          : isFieldTouched("name")
                          ? "border-green-500 focus:ring-green-500"
                          : "focus:ring-orange-500"
                      }`}
                      disabled={isSubmitting || editingType === "pack"}
                    />
                    {getFieldError("name") && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {getFieldError("name")?.message as string}
                      </p>
                    )}
                  </div>

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
                        placeholder="50"
                        className={`h-12 pl-8 transition-all ${
                          getFieldError("price")
                            ? "border-red-500 focus:ring-red-500"
                            : isFieldTouched("price")
                            ? "border-green-500 focus:ring-green-500"
                            : "focus:ring-orange-500"
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Additional cost for this extra
                    </p>
                    {getFieldError("price") && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {getFieldError("price")?.message as string}
                      </p>
                    )}
                  </div>

                  {/* Description Field */}
                  {editingType !== "pack" && (
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="description"
                        className="flex items-center gap-1"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="e.g. Disposable plastic container for easy takeaway..."
                        className={`min-h-[100px] mt-1.5 transition-all ${
                          getFieldError("description")
                            ? "border-red-500 focus:ring-red-500"
                            : isFieldTouched("description")
                            ? "border-green-500 focus:ring-green-500"
                            : "focus:ring-orange-500"
                        }`}
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Optional: Add details about this extra
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Upload Section */}
              {editingType !== "pack" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Extra Image (Optional)
                    </h3>
                  </div>

                  <div>
                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-orange-800 dark:text-orange-300">
                          <strong>Pro tip:</strong> Upload a clear image to help
                          customers visualize the extra item.
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
                          disabled={isSubmitting}
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
                          Recommended: High-resolution JPG or PNG, max 5MB,
                          square format
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
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-8 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      {editingId ? "Update Extra" : "Add Extra"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <Card
        id="extras-list"
        className="w-full bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-2xl border-0 py-4"
      >
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <span className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 p-2 rounded-full">
            <ImageIcon className="w-6 h-6 text-orange-500 fill-orange-500" />
          </span>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Your Extras
              {extras.length + packs.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({extras.length + packs.length})
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your menu add-ons
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading === "pending" ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading extras...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-3">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <Button
                className="mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                onClick={() => dispatch(listAsyncExtras(vendorId as string))}
              >
                Retry
              </Button>
            </div>
          ) : extras.length + packs.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">
                No extras yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Add your first extra to get started
              </p>
              <Button
                onClick={() => setIsFormCollapsed(false)}
                className="h-10 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Extra
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packs.map((pack: IPackFetched) =>
                  renderItemCard(pack, "pack")
                )}
                {visibleExtras.map((extra: IFetchedExtras) =>
                  renderItemCard(extra, "extra")
                )}
              </div>

              {(hasMore || canShowLess) && (
                <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {hasMore && (
                    <Button
                      variant="outline"
                      onClick={handleShowMore}
                      className="h-10 min-w-[140px]"
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show More ({extras.length - visibleCount})
                    </Button>
                  )}
                  {canShowLess && (
                    <Button
                      variant="outline"
                      onClick={handleShowLess}
                      className="h-10 min-w-[140px]"
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtrasManagementForm;
