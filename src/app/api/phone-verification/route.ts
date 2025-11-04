import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationSMS, verifyCode } from '@/utils/phoneVerification';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, action, code } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (action === 'send') {
      // Send verification code
      const result = await sendVerificationSMS(phoneNumber);
      
      if (result.success) {
        return NextResponse.json(result);
      } else {
        return NextResponse.json(result, { status: 400 });
      }
    } else if (action === 'verify') {
      // Verify the code
      if (!code) {
        return NextResponse.json(
          { success: false, message: 'Verification code is required' },
          { status: 400 }
        );
      }

      const result = verifyCode(phoneNumber, code);
      
      if (result.success) {
        return NextResponse.json(result);
      } else {
        return NextResponse.json(result, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 