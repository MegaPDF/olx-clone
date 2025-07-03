import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { signUpSchema } from '@/lib/validations';
import { generateRandomString } from '@/lib/utils';
import { emailService } from '@/lib/services/email';
import type { ApiResponse, UserProfile } from '@/lib/types';

// POST /api/auth/register - User registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = signUpSchema.parse(body);

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: validatedData.email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'Email already registered'
        }
      }, { status: 400 });
    }

    // Check if phone already exists (if provided)
    if (validatedData.phone) {
      const existingPhone = await User.findOne({ phone: validatedData.phone });
      if (existingPhone) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'PHONE_EXISTS',
            message: 'Phone number already registered'
          }
        }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Generate email verification token
    const verificationToken = generateRandomString(32);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const newUser = await User.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      phone: validatedData.phone,
      location: validatedData.location,
      verification: {
        email: {
          verified: false,
          token: verificationToken,
          expiresAt: verificationExpiry
        },
        phone: {
          verified: false
        }
      },
      preferences: {
        language: validatedData.preferences?.language || 'en',
        currency: validatedData.preferences?.currency || 'USD',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        theme: 'system'
      }
    });

    // Send verification email
    try {
      await emailService.sendEmailVerification(
        validatedData.email,
        validatedData.name,
        verificationToken,
        validatedData.preferences?.language || 'en'
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Return user data (without password and sensitive info)
    const userResponse: UserProfile = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      phone: newUser.phone,
      location: newUser.location,
      preferences: newUser.preferences,
      verification: {
        email: {
          verified: newUser.verification.email.verified
          // Don't return token in response
        },
        phone: {
          verified: newUser.verification.phone.verified
        }
      },
      stats: newUser.stats,
      subscription: newUser.subscription,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    const response: ApiResponse<UserProfile> = {
      success: true,
      data: userResponse,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('POST /api/auth/register error:', error);

    if (error instanceof (await import('zod')).ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Registration failed'
      }
    }, { status: 500 });
  }
}
