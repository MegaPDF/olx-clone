import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';
import type { ApiResponse, CategoryDetail } from '@/lib/types';

// GET /api/categories/[id] - Get category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const category = await Category.findById(params.id)
      .populate('parent', 'name slug')
      .populate('children', 'name slug description');

    if (!category) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        }
      }, { status: 404 });
    }

    const response: ApiResponse<CategoryDetail> = {
      success: true,
      data: category,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/categories/[id] error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch category'
      }
    }, { status: 500 });
  }
}