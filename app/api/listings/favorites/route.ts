// app/api/listings/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Listing } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';
import type { ApiPaginatedResponse, ListingCard } from '@/lib/types';

// GET /api/listings/favorites - Get user's favorite listings
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const sort = searchParams.get('sort') || 'dateAdded';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    await connectDB();

    // TODO: When Favorite model is implemented, use proper favorites collection
    // For now, returning empty array as placeholder
    
    // This would be the actual implementation:
    /*
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: {
          user: new mongoose.Types.ObjectId(session.user.id)
        }
      },
      {
        $lookup: {
          from: 'listings',
          localField: 'listing',
          foreignField: '_id',
          as: 'listingInfo',
          pipeline: [
            {
              $match: {
                status: 'active'
              }
            }
          ]
        }
      },
      {
        $unwind: '$listingInfo'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'listingInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $addFields: {
          'listingInfo.category': { $arrayElemAt: ['$categoryInfo', 0] }
        }
      },
      {
        $sort: {
          [sort === 'dateAdded' ? 'createdAt' : `listingInfo.${sort}`]: order
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          listing: '$listingInfo',
          dateAdded: '$createdAt'
        }
      }
    ];

    const [favorites, totalCount] = await Promise.all([
      Favorite.aggregate(pipeline),
      Favorite.countDocuments({ user: session.user.id })
    ]);
    */

    // Placeholder implementation
    const favorites: any[] = [];
    const totalCount = 0;
    const pages = Math.ceil(totalCount / limit);

    const formattedListings: ListingCard[] = favorites.map(fav => ({
      id: fav.listing._id.toString(),
      title: fav.listing.title,
      price: fav.listing.price,
      images: [fav.listing.images[0]],
      location: {
        city: fav.listing.location.city,
        state: fav.listing.location.state
      },
      condition: fav.listing.condition,
      features: fav.listing.features,
      stats: {
        views: fav.listing.stats.views,
        favorites: fav.listing.stats.favorites
      },
      isFavorited: true,
      createdAt: fav.listing.createdAt
    }));

    const response: ApiPaginatedResponse<ListingCard> = {
      success: true,
      data: formattedListings,
      pagination: {
        page,
        limit,
        total: totalCount,
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
    console.error('GET /api/listings/favorites error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch favorites'
      }
    }, { status: 500 });
  }
}

// POST /api/listings/favorites - Add listing to favorites
export async function POST(request: NextRequest) {
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
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_LISTING_ID',
          message: 'Listing ID is required'
        }
      }, { status: 400 });
    }

    await connectDB();

    // Verify listing exists and is active
    const listing = await Listing.findOne({
      _id: listingId,
      status: 'active'
    });

    if (!listing) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'LISTING_NOT_FOUND',
          message: 'Listing not found or not available'
        }
      }, { status: 404 });
    }

    // Prevent users from favoriting their own listings
    if (listing.seller.toString() === session.user.id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CANNOT_FAVORITE_OWN_LISTING',
          message: 'You cannot favorite your own listing'
        }
      }, { status: 400 });
    }

    // TODO: When Favorite model is implemented, create favorite
    /*
    const existingFavorite = await Favorite.findOne({
      user: session.user.id,
      listing: listingId
    });

    if (existingFavorite) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ALREADY_FAVORITED',
          message: 'Listing is already in favorites'
        }
      }, { status: 400 });
    }

    await Favorite.create({
      user: session.user.id,
      listing: listingId
    });
    */

    // Update listing favorites count
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { 'stats.favorites': 1 }
    });

    const response = {
      success: true,
      data: {
        message: 'Listing added to favorites'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('POST /api/listings/favorites error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add favorite'
      }
    }, { status: 500 });
  }
}
