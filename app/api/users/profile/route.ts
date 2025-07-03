import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { auth } from '@/lib/auth';
import { updateUserProfileSchema } from '@/lib/validations';
import { generateRandomString } from '@/lib/utils';
import type { ApiResponse, UserProfile } from '@/lib/types';

// GET /api/users/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      }, { status: 404 });
    }

    const userProfile: UserProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      location: user.location,
      preferences: user.preferences,
      verification: user.verification,
      stats: user.stats,
      subscription: user.subscription,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    const response: ApiResponse<UserProfile> = {
      success: true,
      data: userProfile,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/users/profile error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch profile'
      }
    }, { status: 500 });
  }
}

// PUT /api/users/profile - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateUserProfileSchema.parse(body);

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      }, { status: 404 });
    }

    // Check if phone number is being changed and if it's already taken
    if (validatedData.phone && validatedData.phone !== user.phone) {
      const existingUser = await User.findOne({ 
        phone: validatedData.phone,
        _id: { $ne: session.user.id }
      });

      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'PHONE_EXISTS',
            message: 'Phone number already registered'
          }
        }, { status: 400 });
      }

      // Reset phone verification if phone changed
      if (validatedData.phone !== user.phone) {
        validatedData.verification = {
          ...validatedData.verification,
          phone: { verified: false }
        };
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select('-password').lean();

    const userProfile: UserProfile = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      location: updatedUser.location,
      preferences: updatedUser.preferences,
      verification: updatedUser.verification,
      stats: updatedUser.stats,
      subscription: updatedUser.subscription,
      role: updatedUser.role,
      status: updatedUser.status,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    const response: ApiResponse<UserProfile> = {
      success: true,
      data: userProfile,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('PUT /api/users/profile error:', error);

    if (error.name === 'ZodError') {
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
        message: 'Failed to update profile'
      }
    }, { status: 500 });
  }
}

// PATCH /api/users/profile - Partial profile update (for preferences, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    const body = await request.json();

    await connectDB();

    // Update only specified fields
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      }, { status: 404 });
    }

    const userProfile: UserProfile = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      location: updatedUser.location,
      preferences: updatedUser.preferences,
      verification: updatedUser.verification,
      stats: updatedUser.stats,
      subscription: updatedUser.subscription,
      role: updatedUser.role,
      status: updatedUser.status,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    const response: ApiResponse<UserProfile> = {
      success: true,
      data: userProfile,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('PATCH /api/users/profile error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update profile'
      }
    }, { status: 500 });
  }
}