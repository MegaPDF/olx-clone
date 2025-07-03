import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { generateRandomString } from '@/lib/utils';
import type { ApiResponse, UserProfile } from '@/lib/types';

// GET /api/auth/session - Get current session info
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'User not authenticated'
        }
      }, { status: 401 });
    }

    await connectDB();

    // Get fresh user data from database
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

    const response: ApiResponse<{
      user: UserProfile;
      session: typeof session;
    }> = {
      success: true,
      data: {
        user: userProfile,
        session
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/auth/session error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get session'
      }
    }, { status: 500 });
  }
}