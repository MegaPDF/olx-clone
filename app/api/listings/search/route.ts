import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Listing, Category } from '@/models';
import { generateRandomString } from '@/lib/utils';
import type { SearchApiResponse } from '@/lib/types';

// GET /api/search - Advanced search with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const condition = searchParams.get('condition');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const sort = searchParams.get('sort') || 'createdAt';
    const order: 1 | -1 = searchParams.get('order') === 'asc' ? 1 : -1;

    await connectDB();

    // Build search query
    let query: any = { status: 'active' };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    if (condition) {
      query.condition = condition;
    }

    const skip = (page - 1) * limit;

    // Execute search with aggregation for filters
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'seller',
          foreignField: '_id',
          as: 'sellerInfo',
          pipeline: [{ $project: { name: 1, avatar: 1, rating: 1 } }]
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$categoryInfo', 0] },
          seller: { $arrayElemAt: ['$sellerInfo', 0] }
        }
      },
      { $sort: { [sort as string]: order } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'count' }],
          filters: [
            {
              $group: {
                _id: null,
                categories: { $addToSet: { id: '$category._id', name: '$category.name' } },
                locations: { $addToSet: '$location.city' },
                conditions: { $addToSet: '$condition' },
                priceStats: {
                  $push: '$price'
                }
              }
            }
          ]
        }
      }
    ];

    const [result] = await Listing.aggregate(pipeline);

    const total = result.total[0]?.count || 0;
    const filters = result.filters[0] || {};

    const response: SearchApiResponse = {
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        categories: filters.categories || [],
        locations: (filters.locations || []).map((city: string) => ({ city, count: 0 })),
        priceRanges: [],
        conditions: (filters.conditions || []).map((condition: string) => ({ condition, count: 0 }))
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/search error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Search failed'
      }
    }, { status: 500 });
  }
}