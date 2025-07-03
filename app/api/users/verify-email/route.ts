import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { emailVerificationSchema } from '@/lib/validations';
import { generateRandomString } from '@/lib/utils';
import { emailService } from '@/lib/services/email';
import type { ApiResponse } from '@/lib/types';

// POST /api/users/verify-email - Verify email with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = emailVerificationSchema.parse(body);

    await connectDB();

    const user = await User.findOne({
      'verification.email.token': validatedData.token,
      'verification.email.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired verification token'
        }
      }, { status: 400 });
    }

    // Mark email as verified
    await User.findByIdAndUpdate(user._id, {
      'verification.email.verified': true,
      'verification.email.token': undefined,
      'verification.email.expiresAt': undefined
    });

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Email verified successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('POST /api/users/verify-email error:', error);

    if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: (error as any).errors
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify email'
      }
    }, { status: 500 });
  }
}

// PUT /api/users/verify-email - Resend verification email
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email is required'
        }
      }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      }, { status: 404 });
    }

    if (user.verification.email.verified) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ALREADY_VERIFIED',
          message: 'Email already verified'
        }
      }, { status: 400 });
    }

    // Generate new verification token
    const verificationToken = generateRandomString(32);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await User.findByIdAndUpdate(user._id, {
      'verification.email.token': verificationToken,
      'verification.email.expiresAt': verificationExpiry
    });

    // Send verification email
    await emailService.sendEmailVerification(
      user.email,
      user.name,
      verificationToken,
      user.preferences?.language || 'en'
    );

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Verification email sent successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('PUT /api/users/verify-email error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send verification email'
      }
    }, { status: 500 });
  }
}
