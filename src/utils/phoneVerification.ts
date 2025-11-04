import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Store verification codes in memory (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export interface VerificationResult {
  success: boolean;
  message: string;
}

// Generate a random 6-digit code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification SMS
export const sendVerificationSMS = async (phoneNumber: string): Promise<VerificationResult> => {
  try {
    console.log("The phone number is ",phoneNumber);
    const verificationCode = generateVerificationCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store the code
    verificationCodes.set(phoneNumber, { code: verificationCode, expiresAt });

    // Send SMS via Twilio
    await client.messages.create({
      body: `Your RideEx verification code is: ${verificationCode}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phoneNumber,
    });

    return {
      success: true,
      message: 'Verification code sent successfully!',
    };
  } catch (error) {
    console.error('Error sending verification SMS:', error);
    return {
      success: false,
      message: 'Failed to send verification code. Please try again.',
    };
  }
};

// Verify the code
export const verifyCode = (phoneNumber: string, code: string): VerificationResult => {
  const storedData = verificationCodes.get(phoneNumber);
  
  if (!storedData) {
    return {
      success: false,
      message: 'No verification code found. Please request a new code.',
    };
  }

  if (Date.now() > storedData.expiresAt) {
    verificationCodes.delete(phoneNumber);
    return {
      success: false,
      message: 'Verification code has expired. Please request a new code.',
    };
  }

  if (storedData.code !== code) {
    return {
      success: false,
      message: 'Invalid verification code. Please try again.',
    };
  }

  // Remove the code after successful verification
  verificationCodes.delete(phoneNumber);

  return {
    success: true,
    message: 'Phone number verified successfully!',
  };
};

// Clean up expired codes (run this periodically)
export const cleanupExpiredCodes = (): void => {
  const now = Date.now();
  for (const [phoneNumber, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(phoneNumber);
    }
  }
}; 