// app/api/listings/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Listing, User } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';
import type { ApiPaginatedResponse, ListingCard } from '@/lib/types';

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

    // Check if Favorite model exists, if not fall back to listing-based favorites
    let favorites: any[] = [];
    let totalCount = 0;

    try {
      // Try to use Favorite model if it exists
      const { Favorite } = require('@/models');
      const skip = (page - 1) * limit;

      const pipeline = [
        {
          $match: {
            user: session.user.id
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

      const [favoriteResults, count] = await Promise.all([
        Favorite.aggregate(pipeline),
        Favorite.countDocuments({ user: session.user.id })
      ]);

      favorites = favoriteResults;
      totalCount = count;

    } catch (modelError) {
      // Fallback: Use listings collection with favorited field or user favorites array
      console.log('Favorite model not found, using fallback method');
      
      // Alternative implementation - find listings favorited by user
      // This assumes you have a favorites field in user document or listings have favorited users
      const skip = (page - 1) * limit;
      
      const user = await User.findById(session.user.id).select('favorites');
      const favoriteIds = user?.favorites || [];
      
      if (favoriteIds.length > 0) {
        const [listingResults, count] = await Promise.all([
          Listing.find({ 
            _id: { $in: favoriteIds },
            status: 'active'
          })
          .populate('category', 'name slug')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
          Listing.countDocuments({ 
            _id: { $in: favoriteIds },
            status: 'active'
          })
        ]);

        favorites = listingResults.map(listing => ({
          listing,
          dateAdded: new Date() // Fallback date
        }));
        totalCount = count;
      }
    }

    const pages = Math.ceil(totalCount / limit);

    const formattedListings: ListingCard[] = favorites.map(fav => ({
      id: fav.listing._id.toString(),
      title: fav.listing.title,
      price: fav.listing.price,
      images: fav.listing.images?.slice(0, 1) || [],
      location: {
        city: fav.listing.location?.city || '',
        state: fav.listing.location?.state || ''
      },
      condition: fav.listing.condition,
      features: fav.listing.features || {},
      stats: {
        views: fav.listing.stats?.views || 0,
        favorites: fav.listing.stats?.favorites || 0
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

    // Try to use Favorite model if it exists, otherwise use fallback
    try {
      const { Favorite } = require('@/models');
      
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
        listing: listingId,
        createdAt: new Date()
      });

    } catch (modelError) {
      // Fallback: Add to user's favorites array
      console.log('Favorite model not found, using user favorites array');
      
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

      // Check if already favorited
      if (user.favorites && user.favorites.includes(listingId)) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'ALREADY_FAVORITED',
            message: 'Listing is already in favorites'
          }
        }, { status: 400 });
      }

      // Add to user's favorites
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { favorites: listingId }
      });
    }

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
export async function DELETE(request: NextRequest) {
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

    // Try to use Favorite model if it exists, otherwise use fallback
    let removed = false;

    try {
      const { Favorite } = require('@/models');
      
      const result = await Favorite.findOneAndDelete({
        user: session.user.id,
        listing: listingId
      });

      removed = !!result;

    } catch (modelError) {
      // Fallback: Remove from user's favorites array
      console.log('Favorite model not found, using user favorites array');
      
      const result = await User.findByIdAndUpdate(session.user.id, {
        $pull: { favorites: listingId }
      });

      removed = !!result;
    }

    if (!removed) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FAVORITE_NOT_FOUND',
          message: 'Favorite not found'
        }
      }, { status: 404 });
    }

    // Update listing favorites count
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { 'stats.favorites': -1 }
    });

    const response = {
      success: true,
      data: {
        message: 'Listing removed from favorites'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('DELETE /api/listings/favorites error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to remove favorite'
      }
    }, { status: 500 });
  }
}