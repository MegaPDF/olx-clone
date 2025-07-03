import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { newPasswordSchema } from '@/lib/validations';
import { generateRandomString } from '@/lib/utils';
import type { ApiResponse } from '@/lib/types';

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = newPasswordSchema.parse(body);

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
          message: 'Invalid or expired reset token'
        }
      }, { status: 400 });
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is not active'
        }
      }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Update password and clear reset token
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      'verification.email.token': undefined,
      'verification.email.expiresAt': undefined
    });

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Password reset successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('POST /api/auth/reset-password error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
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
        message: 'Failed to reset password'
      }
    }, { status: 500 });
  }
}
