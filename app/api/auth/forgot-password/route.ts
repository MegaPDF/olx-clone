import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { resetPasswordSchema } from '@/lib/validations';
import { generateRandomString } from '@/lib/utils';
import { emailService } from '@/lib/services/email';
import type { ApiResponse } from '@/lib/types';

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    await connectDB();

    const user = await User.findOne({ 
      email: validatedData.email.toLowerCase() 
    });

    // Always return success for security (don't reveal if email exists)
    const successResponse: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'If the email exists, a reset link has been sent'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    if (!user) {
      return NextResponse.json(successResponse);
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return NextResponse.json(successResponse);
    }

    // Generate reset token
    const resetToken = generateRandomString(32);
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      'verification.email.token': resetToken,
      'verification.email.expiresAt': resetExpiry
    });

    // Send password reset email
    try {
      await emailService.sendPasswordReset(
        user.email,
        user.name,
        resetToken,
        user.preferences?.language || 'en'
      );
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('POST /api/auth/forgot-password error:', error);

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
        message: 'Failed to process password reset'
      }
    }, { status: 500 });
  }
}
