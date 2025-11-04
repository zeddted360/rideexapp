// Utility functions for phone number storage and management

interface PhoneData {
  phoneNumber: string;
  verified: boolean;
  timestamp: number;
}

// Helper function to safely access localStorage
const getLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error);
      return null;
    }
  }
  return null;
};

const setLocalStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
    }
  }
};

const removeLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  }
};

/**
 * Store user phone data in localStorage
 * @param phoneNumber - The phone number to store
 * @param verified - Whether the phone number is verified
 */
export const storeUserPhone = (
  phoneNumber: string,
  verified: boolean = false
): void => {
  const phoneData: PhoneData = {
    phoneNumber,
    verified,
    timestamp: Date.now(),
  };

  setLocalStorage("userPhoneData", JSON.stringify(phoneData));
};

/**
 * Get user phone data from localStorage
 * @returns PhoneData object or null if not found
 */
export const getUserPhone = (): PhoneData | null => {
  const phoneData = getLocalStorage("userPhoneData");

  if (!phoneData) {
    return null;
  }

  try {
    const parsed = JSON.parse(phoneData) as PhoneData;

    // Validate the data structure
    if (
      typeof parsed.phoneNumber === "string" &&
      typeof parsed.verified === "boolean" &&
      typeof parsed.timestamp === "number"
    ) {
      return parsed;
    }

    console.warn("Invalid phone data structure in localStorage");
    return null;
  } catch (error) {
    console.warn("Failed to parse phone data from localStorage:", error);
    return null;
  }
};

/**
 * Check if user phone data exists and is valid
 * @returns boolean indicating if valid phone data exists
 */
export const hasUserPhone = (): boolean => {
  const phoneData = getUserPhone();
  return phoneData !== null && phoneData.phoneNumber.length > 0;
};

/**
 * Get just the phone number from localStorage
 * @returns phone number string or empty string if not found
 */
export const getUserPhoneNumber = (): string => {
  const phoneData = getUserPhone();
  return phoneData?.phoneNumber || "";
};

/**
 * Check if the stored phone number is verified
 * @returns boolean indicating if phone is verified
 */
export const isUserPhoneVerified = (): boolean => {
  const phoneData = getUserPhone();
  return phoneData?.verified || false;
};

/**
 * Clear user phone data from localStorage
 */
export const clearUserPhone = (): void => {
  removeLocalStorage("userPhoneData");
};

/**
 * Update phone verification status
 * @param verified - New verification status
 */
export const updatePhoneVerification = (verified: boolean): void => {
  const phoneData = getUserPhone();

  if (phoneData) {
    phoneData.verified = verified;
    phoneData.timestamp = Date.now();
    setLocalStorage("userPhoneData", JSON.stringify(phoneData));
  }
};

/**
 * Check if stored phone data is older than specified time
 * @param maxAgeMs - Maximum age in milliseconds (default: 24 hours)
 * @returns boolean indicating if data is expired
 */
export const isPhoneDataExpired = (
  maxAgeMs: number = 24 * 60 * 60 * 1000
): boolean => {
  const phoneData = getUserPhone();

  if (!phoneData) {
    return true;
  }

  const now = Date.now();
  const age = now - phoneData.timestamp;

  return age > maxAgeMs;
};
