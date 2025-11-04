// utils/schema.ts
import { z } from "zod";

// Custom refinement to validate FileList and extract the first File
const fileListSchema = z
  .custom<FileList | string | undefined>((value) => {
    // Check if we're in a browser environment and if the value is a FileList
    if (typeof window !== "undefined" && value instanceof FileList) {
      return value.length > 0;
    }
    return true; // Allow during SSR
  }, "At least one file is required")
  .refine((value) => {
    if (typeof window !== "undefined" && value instanceof FileList) {
      return Array.from(value).every((file) => file.size <= 5 * 1024 * 1024);
    }
    return true; // Allow during SSR
  }, "File must be less than 5MB")
  .refine((value) => {
    if (typeof window !== "undefined" && value instanceof FileList) {
      return Array.from(value).every((file) =>
        ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
          file.type
        )
      );
    }
    return true; // Allow during SSR
  }, "File must be JPEG, PNG, JPG, or WebP");

const scheduleDaySchema = z
  .object({
    day: z.enum([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]),
    openTime: z
      .string()
      .regex(
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
        "Open time must be in HH:MM format (e.g., 09:00)"
      )
      .nullable()
      .optional(),
    closeTime: z
      .string()
      .regex(
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
        "Close time must be in HH:MM format (e.g., 22:00)"
      )
      .nullable()
      .optional(),
    isClosed: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isClosed) {
        return data.openTime === null && data.closeTime === null;
      }
      return data.openTime !== null && data.closeTime !== null;
    },
    {
      message:
        "If not closed, both open and close times must be provided; if closed, both must be null",
      path: ["openTime"],
    }
  )
  .refine(
    (data) => {
      if (!data.isClosed && data.openTime && data.closeTime) {
        const [openH, openM] = data.openTime.split(":").map(Number);
        const [closeH, closeM] = data.closeTime.split(":").map(Number);
        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;
        return openMinutes <= closeMinutes;
      }
      return true;
    },
    {
      message: "Open time must be before or equal to close time",
      path: ["closeTime"],
    }
  );

export const restaurantSchema = z.object({
  name: z
    .string()
    .min(1, "Restaurant name is required")
    .max(255, "Name is too long"),
  logo: fileListSchema,
  rating: z
    .number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5"),
  deliveryTime: z
    .string()
    .min(1, "Delivery time is required")
    .max(50, "Delivery time is too long"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category is too long"),
  vendorId: z.string().optional(),
  schedule: z
    .array(scheduleDaySchema)
    .length(7, "Schedule must include exactly 7 days"),
  addresses: z
    .array(z.string())
    .min(1, "At least one address (main branch) is required")
    .max(3, "Maximum 3 addresses allowed"),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(255, "Name is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  price: z.string().min(1, "Price is required").max(50, "Price is too long"),
  originalPrice: z
    .string()
    .min(1, "Original price is required")
    .max(50, "Original price is too long"),
  image: fileListSchema,
  cookTime: z
    .string()
    .min(1, "Cook time is required")
    .max(50, "Cook time is too long"),
  category: z.enum(["veg", "non-veg"], {
    required_error: "Category is required",
  }),
  restaurantId: z
    .string()
    .min(1, "Restaurant is required")
    .max(36, "Restaurant ID is too long"),
  needsTakeawayContainer: z.boolean().optional(),
  extraPortion: z.boolean().optional(),
});

export const featuredItemSchema = z.object({
  name: z
    .string()
    .min(1, "Featured name is required")
    .max(255, "Name is too long"),
  price: z.string().min(1, "Price is required").max(50, "Price is too long"),
  image: fileListSchema,
  rating: z
    .number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5"),
  restaurantId: z
    .string()
    .min(1, "Restaurant is required")
    .max(36, "Restaurant ID is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  category: z.enum(["veg", "non-veg"], {
    required_error: "Category is required",
  }),
});

export const popularItemSchema = z.object({
  name: z
    .string()
    .min(1, "Popular item name is required")
    .max(255, "Name is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  price: z.string().min(1, "Price is required").max(50, "Price is too long"),
  originalPrice: z
    .string()
    .min(1, "Original price is required")
    .max(50, "Original price is too long"),
  image: fileListSchema,
  rating: z
    .number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5"),
  reviewCount: z.number().min(0, "Review count must be 0 or more"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category is too long"),
  cookingTime: z
    .string()
    .min(1, "Cooking time is required")
    .max(50, "Cooking time is too long"),
  isPopular: z.boolean(),
  discount: z.string().max(50, "Discount is too long"),
  restaurantId: z
    .string()
    .min(1, "Restaurant is required")
    .max(36, "Restaurant ID is too long"),
});

export const discountSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    restaurantId: z.string(),
    description: z
      .string()
      .min(1, "Description is required")
      .max(1000, "Description is too long"),
    discountType: z.enum(["percentage", "fixed"], {
      required_error: "Discount type is required",
    }),
    originalPrice: z
      .number({ required_error: "Original value is required" })
      .positive("Original price must be greater than 0"),
    discountedPrice: z
      .number({ required_error: "Discount price is required" })
      .positive("Discounted price must be greater than 0"),
    discountValue: z
      .number({ required_error: "Discount value is required" })
      .positive("Discount value must be greater than 0"),
    validFrom: z
      .string()
      .min(1, "Valid from date is required")
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    validTo: z
      .string()
      .min(1, "Valid to date is required")
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    minOrderValue: z
      .number({ required_error: "Min order value is required" })
      .min(0, "Min order value cannot be negative")
      .optional()
      .or(z.literal(0)),
    maxUses: z
      .number({ required_error: "Max uses is required" })
      .min(0, "Max uses cannot be negative")
      .optional()
      .or(z.literal(0)),
    code: z.string().max(50, "Code is too long").optional(),
    appliesTo: z.enum(["new", "deal", "exclusive", "limited-time"], {
      required_error: "Applies to is required",
    }),
    targetId: z.string().max(36, "Target ID is too long").optional(),
    image: fileListSchema,
    isActive: z.boolean(),
  })
  .refine((data) => new Date(data.validFrom) < new Date(data.validTo), {
    message: "Valid to date must be after valid from date",
    path: ["validTo"],
  })
  .superRefine((data, ctx) => {
    // Conditional validation for discountValue based on discountType
    if (data.discountType === "percentage") {
      if (data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Discount cannot exceed 100%",
          path: ["discountValue"],
        });
      }
    } else {
      // fixed
      if (data.discountValue > data.originalPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fixed discount cannot exceed original price",
          path: ["discountValue"],
        });
      }
    }
    // Ensure discountedPrice matches the calculation
    let expectedDiscounted: number;
    if (data.discountType === "percentage") {
      expectedDiscounted =
        Math.round(data.originalPrice * (1 - data.discountValue / 100) * 100) /
        100;
    } else {
      expectedDiscounted =
        Math.round((data.originalPrice - data.discountValue) * 100) / 100;
    }
    if (data.discountedPrice !== expectedDiscounted) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discounted price must match the calculated value",
        path: ["discountedPrice"],
      });
    }
  });

export const vendorRegistrationSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(
        /^(\+234|0)[789]\d{9}$/,
        "Please enter a valid Nigerian phone number"
      ),
    email: z.string().email("Please enter a valid email address"),
    catchmentArea: z.string().min(1, "Please select a catchment area"),
    location: z.string().min(3, "Location must be at least 3 characters"),
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters"),
    category: z.string().min(1, "Please select a category"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    agreeTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must agree to the terms and conditions"
      ),
    whatsappUpdates: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// promo offers schema below
export const PromofferItemSchema = z.object({
  name: z
    .string()
    .min(1, "Promo offer name is required")
    .max(255, "Name is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  originalPrice: z
    .number()
    .min(1, "Original price is required")
    .max(50, "Original price is too long"),
  discountedPrice: z
    .number()
    .min(1, "Discounted price is required")
    .max(50, "Discounted price is too long"),
  image: fileListSchema,
  restaurantId: z
    .string()
    .min(1, "Restaurant is required")
    .max(36, "Restaurant ID is too long"),
  category: z.enum(["veg", "non-veg"], {
    required_error: "Category is required",
  }),
});

export type VendorRegistrationFormData = z.infer<
  typeof vendorRegistrationSchema
>;
export type FeaturedItemFormData = z.infer<typeof featuredItemSchema>;
export type PromoOfferItemFormData = z.infer<typeof PromofferItemSchema>;
export type RestaurantFormData = z.infer<typeof restaurantSchema>;
export type MenuItemFormData = z.infer<typeof menuItemSchema>;
export type PopularItemFormData = z.infer<typeof popularItemSchema>;
export type DiscountFormData = z.infer<typeof discountSchema>;
