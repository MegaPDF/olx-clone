// DELETE favorite

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Listing } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';
import type { ApiResponse } from '@/lib/types';

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

    // TODO: When Favorite model is implemented, remove favorite
    /*
    const favorite = await Favorite.findOneAndDelete({
      user: session.user.id,
      listing: listingId
    });

    if (!favorite) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FAVORITE_NOT_FOUND',
          message: 'Favorite not found'
        }
      }, { status: 404 });
    }
    */

    // Update listing favorites count
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { 'stats.favorites': -1 }
    });

    const response: ApiResponse<{ message: string }> = {
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