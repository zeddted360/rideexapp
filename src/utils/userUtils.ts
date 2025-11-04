import { RootState } from '@/state/store';

/**
 * Get user's phone number from auth state
 */
export const getUserPhoneFromAuth = (state: RootState): string | null => {
  const user = state.auth.user;
  return user?.phoneVerified && user?.phoneNumber ? user.phoneNumber : null;
};

/**
 * Check if user has verified phone number
 */
export const hasVerifiedPhoneFromAuth = (state: RootState): boolean => {
  const user = state.auth.user;
  return user?.phoneVerified === true && !!user?.phoneNumber;
};

/**
 * Get user's phone number for SMS (from auth state)
 */
export const getPhoneForSMSFromAuth = (state: RootState): string | null => {
  return getUserPhoneFromAuth(state);
};

/**
 * Get complete user data including phone number
 */
export const getUserWithPhone = (state: RootState) => {
  const user = state.auth.user;
  if (!user) return null;
  
  return {
    ...user,
    hasPhone: hasVerifiedPhoneFromAuth(state),
    phoneForSMS: getPhoneForSMSFromAuth(state),
  };
}; 