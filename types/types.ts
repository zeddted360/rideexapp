import { Models } from "appwrite";

export interface IUser {
  userId: string;
  username: string;
  email: string;
  role: "admin" | "user" | "vendor";
  phoneNumber?: string;
  phoneVerified?: boolean;
  isAdmin?: boolean;
  fullName?: string;
  code?: string | null;
}

export interface IUserFectched extends IUser, Models.Document {
  isVendor: boolean;
  verificationCode?: string;
  codeExpiration?: string;
  isBlocked?: boolean;
}

export interface AuthState {
  user: IUser | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

export interface IMenuItem {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  image: string;
  category: "veg" | "non-veg";
  cookTime: string;
  isApproved?: boolean;
  extras?: string[];
  needsTakeawayContainer?: boolean;
  extraPortion?: boolean;
}

export interface IMenuItemFetched extends IMenuItem, Models.Document {}

export interface IScheduleDay {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

export interface IRestaurant {
  name: string;
  logo: FileList | string;
  rating: number;
  deliveryTime: string;
  category: string;
  vendorId?: string;
  schedule?: IScheduleDay[];
  addresses: string[];
  isPaused?: boolean;
}

export interface IRestaurantFetched extends IRestaurant, Models.Document { };

export interface IFeaturedItem {
  name: string;
  price: string;
  image: string;
  rating: number;
  restaurant: string;
  description: string;
  category: string;
  isApproved?: boolean;
  extras?: string[];
}

export interface IFeaturedItemFetched extends IFeaturedItem, Models.Document {}

// inital cart item
export interface ICartItem {
  userId: string;
  itemId: string;
  // item: string;
  name: string;
  image: string;
  price: string | number;
  restaurantId: string;
  quantity: number;
  category: string;
  source: "menu" | "featured" | "popular" | "discount" | "offer" | "";
  description?: string;
  extras?: string[];
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  minOrderValue?: number;
  maxUses?: number;
  code?: string;
  appliesTo?: "all" | "item" | "category" | "restaurant";
  targetId?: string;
  validFrom?: string;
  validTo?: string;
}

//  cart item order processed
export interface ICartItemOrder extends ICartItem {
  specialInstructions?: string;
  totalPrice: number;
  status: "pending" | "processing" | "success";
  selectedExtras?: ISelectedExtra[] | string[];
}

export interface ICartItemFetched extends ICartItemOrder, Models.Document {}

export interface IPromoOffer {
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  category: "veg" | "non-veg";
  image: string;
  restaurantId: string;
  isApproved?: boolean;
  extras?: string[];
}

export interface IPromoOfferFetched extends IPromoOffer, Models.Document {}

export interface IPopularItem {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  cookingTime: string;
  isPopular: boolean;
  discount: string;
  isApproved?: boolean;
  extras?: string[];
}

// Fetched popular item (from DB)
export interface IPopularItemFetched extends IPopularItem, Models.Document {}

// Form data for popular item (for react-hook-form)
export interface PopularItemFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviewCount: number;
  image: FileList;
  category: string;
  cookingTime: string;
  isPopular: boolean;
  discount: string;
  restaurantId: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "failed";

// Notification types
export interface INotification {
  type:
    | "admin_new_order"
    | "user_order_confirmation"
    | "order_status_update"
    | "delivery_update";
  recipient: string;
  userId?: string;
  orderId: string;
  address: string;
  customerAddress?: string;
  phone?: string;
  deliveryTime?: string;
  totalAmount?: number;
  items?: string[];
  deliveryDistance?: string;
  deliveryDuration?: string;
  deliveryFee?: number;
  selectedBranchId?: number;
  status: "unread" | "read";
  createdAt: string;
  label?: "Home" | "Work" | "Other"; // Added label for address type
  riderCode?: string;
}

export interface INotificationFetched extends INotification, Models.Document {}

// State interface
export interface INotificationState {
  notifications: INotificationFetched[];
  adminNotifications: INotificationFetched[];
  userNotifications: INotificationFetched[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

export interface IBookedOrderFetched extends Models.Document {
  orderId: string;
  itemIds?: string[];
  items?: string[];
  customerId: string;
  address: string;
  label?: "Home" | "Work" | "Other";
  paymentMethod: string;
  deliveryTime: string;
  createdAt: string;
  total: number;
  amountPaidOnline: number;
  amountDueOnDelivery:number;
  status: OrderStatus;
  phone: string;
  deliveryFee: number;
  deliveryDistance?: string;
  deliveryDuration?: string;
  selectedBranchId: number;
  apartmentFlat?: string;
  paid?: boolean;
  riderCode?: string;
  feedbackRating?: number;
  feedbackComment?: string;
}

export interface ISearchResult {
  id: string;
  name: string;
  type: "restaurant" | "menu" | "popular" | "featured";
  image?: string;
  price?: string;
  description?: string;
  restaurantName?: string;
  restaurantId?: string;
  category?: string;
  rating?: number;
  deliveryTime?: string;
  distance?: string;
  slug?: string;
}
// newly added
export interface IVendor {
  fullName: string;
  phoneNumber: string;
  email: string;
  catchmentArea: string;
  location: string;
  businessName: string;
  category: string;
  password: string;
  agreeTerms: boolean;
  status: "pending" | "approved" | "rejected";
  whatsappUpdates: boolean;
}

export interface IVendorFetched extends IVendor, Models.Document {}

export interface IRiders {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  nin: string;
  bvn?: string;
  driversLicensePicture?: string;
  vehicleType: string;
  previousWorkPlace: string;
  workDuration: string;
  guarantor1Name: string;
  guarantor1Phone: string;
  guarantor1Relationship: string;
  guarantor2Name: string;
  guarantor2Phone: string;
  guarantor2Relationship: string;
  referralCode?: string;
  refferedBy?: string;
  status: string;
}
export interface IRidersFetched extends IRiders, Models.Document {}

export interface IDiscount {
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  originalPrice?: number;
  discountedPrice?: number;
  validFrom: string;
  validTo: string;
  minOrderValue?: number;
  maxUses?: number;
  code?: string;
  appliesTo: "new" | "deal" | "exclusive" | "limited-time";
  targetId?: string;
  image?: string | FileList;
  isActive: boolean;
  usageCount?: number;
  extras?: string[];
  restaurantId?: string;
  isApproved?: boolean;
}
export interface IDiscountFetched extends IDiscount, Models.Document {}

export interface IExtras {
  name: string;
  price: string;
  description?: string;
  image?: string;
  vendorId: string;
}

export interface IFetchedExtras extends IExtras, Models.Document {}

export interface ISelectedExtra {
  extraId: string;
  quantity: number;
}

export interface IPack {
  name: string;
  price: number;
  vendorId: string;
}

export interface IPackFetched extends IPack, Models.Document { }

export interface Branch {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

export interface StructuredItem {
  itemId: string;
  quantity: number;
  extrasIds: string[];
  priceAtOrder: number;
  specialInstructions?: string;
}