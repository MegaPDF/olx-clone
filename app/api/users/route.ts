import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models';
import { auth } from '@/lib/auth';
import { signUpSchema } from '@/lib/validations';
import { generateRandomString } from '@/lib/utils';
import { emailService } from '@/lib/services/email';
import type { ApiResponse, ApiPaginatedResponse, UserProfile } from '@/lib/types';

// GET /api/users - Get users list (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Admin access required'
        }
      }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    // Execute queries
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    const pages = Math.ceil(total / limit);

    const response: ApiPaginatedResponse<UserProfile> = {
      success: true,
      data: users.map(user => ({
        id: user.id.toString(),
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
      })),
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/users error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch users'
      }
    }, { status: 500 });
  }
}

// POST /api/users - Create new user (Public registration)
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
        language: 'en',
        currency: 'USD',
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

    // Return user data (without password)
    const userResponse = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      phone: newUser.phone,
      location: newUser.location,
      preferences: newUser.preferences,
      verification: {
        email: {
          verified: newUser.verification.email.verified,
          // Don't return token in response
        },
        phone: {
          verified: newUser.verification.phone.verified
        }
      },
      stats: newUser.stats,
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
    console.error('POST /api/users error:', error);

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
        message: 'Failed to create user'
      }
    }, { status: 500 });
  }
}