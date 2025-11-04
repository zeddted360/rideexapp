// EditRestaurantModal.tsx
"use client";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  X,
  Upload,
  Clock,
  MapPin,
  Star,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { RestaurantFormData, restaurantSchema } from "@/utils/schema";
import { IRestaurantFetched, IScheduleDay } from "../../../types/types";

interface EditRestaurantModalProps {
  restaurant: IRestaurantFetched | null;
  showEditModal: boolean;
  setShowEditModal: Dispatch<SetStateAction<boolean>>;
  setRestaurant: Dispatch<SetStateAction<IRestaurantFetched | null>>;
  onSubmit: (
    data: RestaurantFormData,
    form: UseFormReturn<RestaurantFormData>
  ) => Promise<void>;
  isUpdating: boolean;
  setIsUpdating: Dispatch<SetStateAction<boolean>>;
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const categories = [
  "African",
  "Bakery",
  "Chinese",
  "Fast food",
  "Grill",
  "Healthy",
  "Premium",
  "Snacks",
];

const EditRestaurantModal: FC<EditRestaurantModalProps> = ({
  restaurant,
  showEditModal,
  setShowEditModal,
  setRestaurant,
  onSubmit,
  isUpdating,
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  if (!restaurant) return null;

  const defaultSchedule: IScheduleDay[] = daysOfWeek.map((day) => ({
    day: day as IScheduleDay["day"],
    openTime: "08:00",
    closeTime: "21:00",
    isClosed: false,
  }));

  const normalizeSchedule = (
    schedule: IScheduleDay[] | undefined
  ): IScheduleDay[] => {
    if (!schedule || schedule.length === 0) return defaultSchedule;

    const map = new Map<string, IScheduleDay>(schedule.map((s) => [s.day, s]));

    return daysOfWeek.map((day) => {
      const existing = map.get(day);
      if (existing) {
        return {
          day: day as IScheduleDay["day"],
          openTime: existing.isClosed ? null : existing.openTime ?? "08:00",
          closeTime: existing.isClosed ? null : existing.closeTime ?? "21:00",
          isClosed: existing.isClosed ?? false,
        };
      }
      return {
        day: day as IScheduleDay["day"],
        openTime: "08:00",
        closeTime: "21:00",
        isClosed: false,
      };
    });
  };

  // Ensure we always have 3 address slots
  const paddedAddresses = (addresses: string[]) => {
    const result = [...addresses];
    while (result.length < 3) result.push("");
    return result.slice(0, 3);
  };

  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant.name,
      category: restaurant.category,
      deliveryTime: restaurant.deliveryTime,
      rating: restaurant.rating || 0,
      vendorId: restaurant.vendorId,
      schedule: normalizeSchedule(restaurant.schedule),
      logo: restaurant.logo,
      addresses: paddedAddresses(restaurant.addresses ?? []),
    },
    mode: "onChange",
  });

  const { watch, setValue, register, formState } = form;
  const schedule = watch("schedule");
  const addresses = watch("addresses");

  // ---------- Logo ----------
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setValue("logo", fileList);
    }
  };

  // ---------- Schedule ----------
  const handleIsClosedChange = (index: number, checked: boolean) => {
    setValue(`schedule.${index}.isClosed`, checked);
    if (checked) {
      setValue(`schedule.${index}.openTime`, null);
      setValue(`schedule.${index}.closeTime`, null);
    } else {
      setValue(`schedule.${index}.openTime`, "08:00");
      setValue(`schedule.${index}.closeTime`, "21:00");
    }
  };

  useEffect(() => {
    schedule.forEach((day, i) => {
      if (day.isClosed && (day.openTime !== null || day.closeTime !== null)) {
        setValue(`schedule.${i}.openTime`, null);
        setValue(`schedule.${i}.closeTime`, null);
      } else if (!day.isClosed && (!day.openTime || !day.closeTime)) {
        setValue(`schedule.${i}.openTime`, day.openTime || "08:00");
        setValue(`schedule.${i}.closeTime`, day.closeTime || "21:00");
      }
    });
  }, [schedule, setValue]);

  // ---------- Address ----------
  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setValue("addresses", newAddresses);
  };

  // ---------- Modal ----------
  const handleClose = () => {
    setShowEditModal(false);
    setRestaurant(null);
    setLogoPreview(null);
    form.reset();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="relative px-8 py-7 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-orange-50 via-orange-50/50 to-white dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent dark:from-orange-900/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Edit Restaurant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update restaurant information and settings
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 shadow-sm hover:shadow border border-gray-200 dark:border-gray-700"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-8 py-8 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50">
          <form
            onSubmit={form.handleSubmit((data) => onSubmit(data, form))}
            className="space-y-8"
          >
            {/* ---------- Logo ---------- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <ImageIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Restaurant Logo
                </Label>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600 border-2 border-dashed border-orange-200 dark:border-gray-600 flex-shrink-0 group transition-all duration-300 hover:border-orange-400 dark:hover:border-orange-500">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : typeof restaurant.logo === "string" ? (
                      <Image
                        src={fileUrl(
                          validateEnv().restaurantBucketId,
                          restaurant.logo
                        )}
                        alt="Current"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="w-10 h-10 text-orange-300 dark:text-gray-500 group-hover:text-orange-400 transition-colors" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleLogoChange}
                      className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-orange-100 dark:file:bg-orange-900/30 file:text-orange-700 dark:file:text-orange-400 file:font-semibold hover:file:bg-orange-200 dark:hover:file:bg-orange-900/40 transition-all border-gray-300 dark:border-gray-600"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG or WEBP (max. 5MB). Leave empty to keep current
                      logo.
                    </p>
                    {formState.errors.logo && (
                      <p className="text-red-500 text-sm font-medium">
                        {formState.errors.logo.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------- Basic Info ---------- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Tag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Basic Information
                </h4>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                  >
                    Restaurant Name
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                    placeholder="Enter restaurant name"
                  />
                  {formState.errors.name && (
                    <p className="text-red-500 text-sm mt-2 font-medium">
                      {formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="category"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                  >
                    Category
                  </Label>
                  <Select
                    value={watch("category")}
                    onValueChange={(v) =>
                      setValue("category", v, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formState.errors.category && (
                    <p className="text-red-500 text-sm mt-2 font-medium">
                      {formState.errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="rating"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2"
                  >
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    nobyl Rating
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    {...register("rating", { valueAsNumber: true })}
                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                    placeholder="0.0"
                  />
                  {formState.errors.rating && (
                    <p className="text-red-500 text-sm mt-2 font-medium">
                      {formState.errors.rating.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ---------- Delivery Details (no distance) ---------- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Delivery Details
                </h4>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <Label
                  htmlFor="deliveryTime"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                >
                  Delivery Time
                </Label>
                <Input
                  id="deliveryTime"
                  {...register("deliveryTime")}
                  className="h-11 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                  placeholder="e.g., 30-45 mins"
                />
                {formState.errors.deliveryTime && (
                  <p className="text-red-500 text-sm mt-2 font-medium">
                    {formState.errors.deliveryTime.message}
                  </p>
                )}
              </div>
            </div>

            {/* ---------- Addresses (Main + 2 Branches) ---------- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Branches
                </h4>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
                {["Main Branch", "Branch 1", "Branch 2"].map((label, idx) => (
                  <div key={idx}>
                    <Label
                      htmlFor={`address-${idx}`}
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block"
                    >
                      {label}{" "}
                      {idx === 0 && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id={`address-${idx}`}
                      value={addresses[idx] ?? ""}
                      onChange={(e) => handleAddressChange(idx, e.target.value)}
                      className="h-11 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                      placeholder={`Enter ${label.toLowerCase()} address`}
                    />
                    {formState.errors.addresses?.[idx] && (
                      <p className="text-red-500 text-sm mt-2 font-medium">
                        {formState.errors.addresses[idx]?.message}
                      </p>
                    )}
                  </div>
                ))}
                {formState.errors.addresses &&
                  !Array.isArray(formState.errors.addresses) && (
                    <p className="text-red-500 text-sm mt-2 font-medium">
                      {formState.errors.addresses.message}
                    </p>
                  )}
              </div>
            </div>

            {/* ---------- Operating Hours ---------- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Operating Hours
                </h4>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                {daysOfWeek.map((day, idx) => {
                  const isClosed = watch(`schedule.${idx}.isClosed`);
                  return (
                    <div
                      key={day}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        isClosed
                          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                          : "bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="w-28 flex-shrink-0">
                          <Label className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {day}
                          </Label>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor={`schedule[${idx}].openTime`}
                              className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block"
                            >
                              Open Time
                            </Label>
                            <Input
                              id={`schedule[${idx}].openTime`}
                              type="time"
                              {...register(`schedule.${idx}.openTime`)}
                              disabled={isClosed}
                              className={`h-10 border-gray-300 dark:border-gray-600 transition-colors ${
                                !isClosed &&
                                "focus:border-orange-500 focus:ring-orange-500"
                              }`}
                            />
                            {formState.errors.schedule?.[idx]?.openTime && (
                              <p className="text-red-500 text-xs mt-1.5 font-medium">
                                {
                                  formState.errors.schedule[idx]?.openTime
                                    ?.message
                                }
                              </p>
                            )}
                          </div>
                          <div>
                            <Label
                              htmlFor={`schedule[${idx}].closeTime`}
                              className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block"
                            >
                              Close Time
                            </Label>
                            <Input
                              id={`schedule[${idx}].closeTime`}
                              type="time"
                              {...register(`schedule.${idx}.closeTime`)}
                              disabled={isClosed}
                              className={`h-10 border-gray-300 dark:border-gray-600 transition-colors ${
                                !isClosed &&
                                "focus:border-orange-500 focus:ring-orange-500"
                              }`}
                            />
                            {formState.errors.schedule?.[idx]?.closeTime && (
                              <p className="text-red-500 text-xs mt-1.5 font-medium">
                                {
                                  formState.errors.schedule[idx]?.closeTime
                                    ?.message
                                }
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              {...register(`schedule.${idx}.isClosed`, {
                                onChange: (e) =>
                                  handleIsClosedChange(idx, e.target.checked),
                              })}
                              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer transition-colors"
                            />
                            <span
                              className={
                                isClosed
                                  ? "text-gray-500 dark:text-gray-400"
                                  : ""
                              }
                            >
                              Closed
                            </span>
                          </Label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-t from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-12 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isUpdating}
            onClick={form.handleSubmit((data) => onSubmit(data, form))}
            className="flex-1 h-12 rounded-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurantModal;
