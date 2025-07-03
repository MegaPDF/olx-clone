import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Listing, User } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';

// POST /api/listings/favorites/[id] - Add listing to favorites (alternative endpoint)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const listingId = params.id;

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

    return NextResponse.json({
      success: true,
      data: {
        message: 'Listing added to favorites'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('POST /api/listings/favorites/[id] error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add favorite'
      }
    }, { status: 500 });
  }
}

// DELETE /api/listings/favorites/[id] - Remove listing from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const listingId = params.id;

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

    return NextResponse.json({
      success: true,
      data: {
        message: 'Listing removed from favorites'
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('DELETE /api/listings/favorites/[id] error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to remove favorite'
      }
    }, { status: 500 });
  }
}