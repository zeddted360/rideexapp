// utils/appwrite.ts
import { Account, Client, Databases, ID, Storage,Messaging } from "appwrite";

// Interface to define the structure of environment variables
interface EnvConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  restaurantsCollectionId: string;
  menuItemsCollectionId: string;
  restaurantBucketId: string;
  menuBucketId: string;
  orderId: string;
  featuredId: string;
  featuredBucketId: string;
  popularBucketId: string;
  popularItemsCollectionId: string;
  userCollectionId: string;
  googleMapsApiKey: string;
  bookedOrdersCollectionId: string;
  mapBoxAccessToken: string;
  notificationCollectionId: string;
  payStackPublickKey: string;
  newsLetterCollectionId: string;
  vendorsCollectionId: string;
  ridersCollectionId: string;
  driversLicenceBucketId: string;
  promoOfferCollectionId: string;
  promoOfferBucketId: string;
  discountsCollectionId: string;
  discountBucketId: string;
  promoImagesBucketId: string;
  categoryLogosBucketId: string;
  extrasCollectionId: string;
  extrasBucketId: string;
  smartSmsApiToken: string;
  smartSmsSenderId: string;
  adminPhoneNumber: string;
  packsCollectionId: string;
  adminPromotionCodesCollectionId: string;
  mapSubscriptionsCollectionId: string;
}

// Validate environment variables
export function validateEnv(): EnvConfig {
  const requiredEnvVars = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_RideEx_DB_ID,
    restaurantsCollectionId:
      process.env.NEXT_PUBLIC_APPWRITE_RideEx_RESTAURANTS_COLLECTION_ID,
    menuItemsCollectionId:
      process.env.NEXT_PUBLIC_APPWRITE_RideEx_MENU_ITEMS_COLLECTION_ID,
    restaurantBucketId: process.env.NEXT_PUBLIC_APPWRITE_RESTAURANT_BUCKET_ID,
    menuBucketId: process.env.NEXT_PUBLIC_APPWRITE_MENU_BUCKET_ID,
    orderId: process.env.NEXT_PUBLIC_APPWRITE_ORDER_ID,
    featuredId: process.env.NEXT_PUBLIC_APPWRITE_FEATURED_ID,
    featuredBucketId: process.env.NEXT_PUBLIC_APPWRITE_FEATURED_BUCKET_ID,
    popularBucketId: process.env.NEXT_PUBLIC_APPWRITE_POPULAR_BUCKET_ID,
    popularItemsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_POPULAR_ID,
    userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY, // Added for Google Maps
    bookedOrdersCollectionId:
      process.env.NEXT_PUBLIC_APPWRITE_BOOKED_ORDERS_COLLECTION_ID,
    mapBoxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    notificationCollectionId:
      process.env.NEXT_PUBLIC_NOTIFICATION_COLLECTION_ID,
    payStackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    newsLetterCollectionId:
      process.env.NEXT_PUBLIC_APPWRITE_NEWSLETTER_COLLECTION_ID,
    vendorsCollectionId: process.env.NEXT_PUBLIC_VENDORS_COLLECTION_ID,
    ridersCollectionId: process.env.NEXT_PUBLIC_RIDERS_COLLECTION_ID,
    promoOfferCollectionId:
      process.env.NEXT_PUBLIC_APPWRITE_PROMO_OFFER_COLLECTION_ID,
    promoOfferBucketId: process.env.NEXT_PUBLIC_APPWRITE_PROMO_OFFER_BUCKET_ID,
    discountsCollectionId:
      process.env.NEXT_PUBLIC_APPWRITE_DISCOUNTS_COLLECTION_ID,
    discountBucketId: process.env.NEXT_PUBLIC_APPWRITE_DISCOUNT_BUCKET_ID,
    promoImagesBucketId:
      process.env.NEXT_PUBLIC_APPWRITE_PROMO_IMAGES_BUCKET_ID,
    categoryLogosBucketId:
      process.env.NEXT_PUBLIC_APPWRITE_CATEGORY_LOGO_BUCKET_ID,
    extrasCollectionId: process.env.NEXT_PUBLIC_EXTRAS_COLLECTION_ID,
    extrasBucketId: process.env.NEXT_PUBLIC_EXTRAS_BUCKET_ID,
    smartSmsApiToken: process.env.NEXT_PUBLIC_RIDEX_SMS_TOKEN,
    smartSmsSenderId: process.env.NEXT_PUBLIC_SENDER_ID,
    adminPhoneNumber: process.env.NEXT_PUBLIC_ADMIN_PHONE_NUMBER,
    packsCollectionId: process.env.NEXT_PUBLIC_PACK_COLLECTION_ID,
    adminPromotionCodesCollectionId:
      process.env.NEXT_PUBLIC_APPWRITE_ADMIN_PROMOTION_COLLECTION!,
    mapSubscriptionsCollectionId: process.env.NEXT_PUBLIC_MAP_SUB_COLLECTION_ID,
  };

  // Check for undefined environment variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => value === undefined)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.log("The missing vars are", missingVars);
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  // Return validated environment variables
  return {
    endpoint: requiredEnvVars.endpoint!,
    projectId: requiredEnvVars.projectId!,
    databaseId: requiredEnvVars.databaseId!,
    restaurantsCollectionId: requiredEnvVars.restaurantsCollectionId!,
    menuItemsCollectionId: requiredEnvVars.menuItemsCollectionId!,
    restaurantBucketId: requiredEnvVars.restaurantBucketId!,
    menuBucketId: requiredEnvVars.menuBucketId!,
    orderId: requiredEnvVars.orderId!,
    featuredId: requiredEnvVars.featuredId!,
    featuredBucketId: requiredEnvVars.featuredBucketId!,
    popularItemsCollectionId: requiredEnvVars.popularItemsCollectionId!,
    popularBucketId: requiredEnvVars.popularBucketId!,
    userCollectionId: requiredEnvVars.userCollectionId!,
    googleMapsApiKey: requiredEnvVars.googleMapsApiKey!,
    bookedOrdersCollectionId: requiredEnvVars.bookedOrdersCollectionId!,
    mapBoxAccessToken: requiredEnvVars.mapBoxAccessToken!,
    notificationCollectionId: requiredEnvVars.notificationCollectionId!,
    payStackPublickKey: requiredEnvVars.payStackPublicKey!,
    newsLetterCollectionId: requiredEnvVars.newsLetterCollectionId!,
    vendorsCollectionId: requiredEnvVars.vendorsCollectionId!,
    ridersCollectionId: requiredEnvVars.ridersCollectionId!,
    promoOfferCollectionId: requiredEnvVars.promoOfferCollectionId!,
    promoOfferBucketId: requiredEnvVars.promoOfferBucketId!,
    discountsCollectionId: requiredEnvVars.discountsCollectionId!,
    discountBucketId: requiredEnvVars.discountBucketId!,
    promoImagesBucketId: requiredEnvVars.promoImagesBucketId!,
    categoryLogosBucketId: requiredEnvVars.categoryLogosBucketId!,
    extrasBucketId: requiredEnvVars.extrasBucketId!,
    extrasCollectionId: requiredEnvVars.extrasCollectionId!,
    smartSmsApiToken: requiredEnvVars.smartSmsApiToken!,
    smartSmsSenderId: requiredEnvVars.smartSmsSenderId!,
    adminPhoneNumber: requiredEnvVars.adminPhoneNumber!,
    packsCollectionId: requiredEnvVars.packsCollectionId!,
    adminPromotionCodesCollectionId:
      requiredEnvVars.adminPromotionCodesCollectionId!,
    mapSubscriptionsCollectionId: requiredEnvVars.mapSubscriptionsCollectionId!,
    driversLicenceBucketId: process.env.NEXT_PUBLIC_APPWRITE_DRIVERS_LICENCE_BUCKET_ID!,
  };
}

// Initialize Appwrite client with validated environment variables
const env = validateEnv();

const client = new Client().setEndpoint(env.endpoint).setProject(env.projectId);

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);
const messaging = new Messaging(client);

// Export configuration object using validated environment variables
export const config = {
  databaseId: env.databaseId,
  restaurantsCollectionId: env.restaurantsCollectionId,
  menuItemsCollectionId: env.menuItemsCollectionId,
  restaurantBucketId: env.restaurantBucketId,
  menuBucketId: env.menuBucketId,
  orderId: env.orderId,
  featuredId: env.featuredId,
  featuredBucketId: env.featuredBucketId,
  googleMapsApiKey: env.googleMapsApiKey,
};

const fileUrl = (bucketId: string, fileId: string) =>
  `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=${
    validateEnv().projectId
  }&mode=admin`;

export { databases, storage, account, fileUrl, client,messaging };
