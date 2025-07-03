import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { generateRandomString } from '@/lib/utils';
import type { ApiResponse } from '@/lib/types';

// POST /api/auth/check-email - Check if email exists (for registration validation)
export async function POST(request: NextRequest) {
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

    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('_id');

    const response: ApiResponse<{ exists: boolean }> = {
      success: true,
      data: {
        exists: !!existingUser
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('POST /api/auth/check-email error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check email'
      }
    }, { status: 500 });
  }
}
