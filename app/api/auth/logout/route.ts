import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';
import type { ApiResponse } from '@/lib/types';

// POST /api/auth/logout - Logout user (for custom logout handling if needed)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'User not authenticated'
        }
      }, { status: 400 });
    }

    // Custom logout logic can be added here
    // For example: logging logout events, updating last activity, etc.

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Logged out successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('POST /api/auth/logout error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Logout failed'
      }
    }, { status: 500 });
  }
}