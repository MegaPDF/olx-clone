import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/models';
import { generateRandomString } from '@/lib/utils';
import type { ApiResponse, CategoryDetail } from '@/lib/types';

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('includeCount') === 'true';
    const parent = searchParams.get('parent');

    let query: any = {};
    if (parent) {
      query.parent = parent === 'null' ? null : parent;
    }

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .sort({ order: 1, name: 1 });

    // Add listing count if requested
    let categoriesWithCount = categories;
    if (includeCount) {
      const { Listing } = require('@/models');
      categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const listingCount = await Listing.countDocuments({
            category: category._id,
            status: 'active'
          });
          return {
            ...category.toObject(),
            listingCount
          };
        })
      );
    }

    const response: ApiResponse<CategoryDetail[]> = {
      success: true,
      data: categoriesWithCount,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/categories error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch categories'
      }
    }, { status: 500 });
  }
}