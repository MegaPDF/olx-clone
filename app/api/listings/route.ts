// app/api/listings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Listing, Category, User } from '@/models';
import { auth } from '@/lib/auth';
import { createListingSchema, searchSchema } from '@/lib/validations';
import { generateRandomString, generateSlug } from '@/lib/utils';
import type { ApiPaginatedResponse, ApiResponse, ListingCard, ListingDetail } from '@/lib/types';

// GET /api/listings - Search and list listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const rawParams = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      location: {
        city: searchParams.get('city') || undefined,
        radius: searchParams.get('radius') ? Number(searchParams.get('radius')) : undefined,
        coordinates: searchParams.get('lat') && searchParams.get('lng') ? {
          latitude: Number(searchParams.get('lat')),
          longitude: Number(searchParams.get('lng'))
        } : undefined
      },
      price: {
        min: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        max: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
      },
      condition: searchParams.get('condition')?.split(',') || undefined,
      sort: searchParams.get('sort') || 'date',
      order: searchParams.get('order') || 'desc',
      page: Number(searchParams.get('page')) || 1,
      limit: Math.min(Number(searchParams.get('limit')) || 20, 100)
    };

    const validatedParams = searchSchema.parse(rawParams);
    
    await connectDB();

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage
    const matchStage: any = {
      status: 'active',
      expiresAt: { $gt: new Date() }
    };

    // Text search
    if (validatedParams.q) {
      matchStage.$text = { $search: validatedParams.q };
    }

    // Category filter
    if (validatedParams.category) {
      const category = await Category.findOne({ slug: validatedParams.category });
      if (category) {
        matchStage.category = category._id;
      }
    }

    // Location filter
    if (validatedParams.location?.city) {
      matchStage['location.city'] = new RegExp(validatedParams.location.city, 'i');
    }

    // Geo location filter
    if (validatedParams.location?.coordinates && validatedParams.location?.radius) {
      matchStage['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [
              validatedParams.location.coordinates.longitude,
              validatedParams.location.coordinates.latitude
            ]
          },
          $maxDistance: validatedParams.location.radius * 1000 // Convert km to meters
        }
      };
    }

    // Price filter
    if (validatedParams.price?.min || validatedParams.price?.max) {
      matchStage['price.amount'] = {};
      if (validatedParams.price.min) {
        matchStage['price.amount'].$gte = validatedParams.price.min;
      }
      if (validatedParams.price.max) {
        matchStage['price.amount'].$lte = validatedParams.price.max;
      }
    }

    // Condition filter
    if (validatedParams.condition?.length) {
      matchStage.condition = { $in: validatedParams.condition };
    }

    pipeline.push({ $match: matchStage });

    // Lookup category info
    pipeline.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo',
        pipeline: [{ $project: { name: 1, slug: 1 } }]
      }
    });

    // Add computed fields
    pipeline.push({
      $addFields: {
        category: { $arrayElemAt: ['$categoryInfo', 0] },
        relevanceScore: validatedParams.q ? { $meta: 'textScore' } : 1
      }
    });

    // Sorting
    const sortStage: any = {};
    if (validatedParams.q) {
      sortStage.relevanceScore = { $meta: 'textScore' };
    }

    switch (validatedParams.sort) {
      case 'price':
        sortStage['price.amount'] = validatedParams.order === 'asc' ? 1 : -1;
        break;
      case 'relevance':
        if (!validatedParams.q) {
          sortStage['features.promoted.isPromoted'] = -1;
        }
        break;
      case 'distance':
        // Distance sorting is handled by $near in geo query
        break;
      default:
        sortStage.createdAt = validatedParams.order === 'asc' ? 1 : -1;
    }

    if (Object.keys(sortStage).length > 0) {
      pipeline.push({ $sort: sortStage });
    }

    // Count total for pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });

    // Pagination
    const skip = ((validatedParams.page ?? 1) - 1) * (validatedParams.limit ?? 20);
    pipeline.push({ $skip: skip }, { $limit: validatedParams.limit });

    // Project final fields
    pipeline.push({
      $project: {
        title: 1,
        price: 1,
        images: { $slice: ['$images', 1] }, // Only first image for card view
        location: { city: '$location.city', state: '$location.state' },
        condition: 1,
        features: 1,
        stats: { views: '$stats.views', favorites: '$stats.favorites' },
        createdAt: 1,
        'category.name': 1,
        'category.slug': 1
      }
    });

    // Execute queries
    const [listings, countResult] = await Promise.all([
      Listing.aggregate(pipeline),
      Listing.aggregate(countPipeline)
    ]);

    const totalCount = countResult[0]?.total || 0;
    const pages = Math.ceil(totalCount / (validatedParams.limit ?? 20));

    // Format response
    const formattedListings: ListingCard[] = listings.map(listing => ({
      id: listing._id.toString(),
      title: listing.title,
      price: listing.price,
      images: listing.images,
      location: listing.location,
      condition: listing.condition,
      features: listing.features,
      stats: listing.stats,
      createdAt: listing.createdAt
    }));

    const response: ApiPaginatedResponse<ListingCard> = {
      success: true,
      data: formattedListings,
      pagination: {
        page: validatedParams.page ?? 1,
        limit: validatedParams.limit ?? 1,
        total: totalCount,
        pages,
        hasNext: (validatedParams.page ?? 1) < pages,
        hasPrev: (validatedParams.page ?? 1) > 1
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/listings error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: (error as any).errors
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch listings'
      }
    }, { status: 500 });
  }
}

// POST /api/listings - Create new listing
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
    const validatedData = createListingSchema.parse(body);

    await connectDB();

    // Verify category exists
    const category = await Category.findById(validatedData.category);
    if (!category || !category.isActive) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_CATEGORY',
          message: 'Invalid or inactive category'
        }
      }, { status: 400 });
    }

    // Check user's listing limits
    const user = await User.findById(session.user.id);
    const activeListingsCount = await Listing.countDocuments({
      seller: session.user.id,
      status: { $in: ['active', 'draft'] }
    });

    const maxListings = user?.subscription?.plan === 'premium' ? 200 : 
                       user?.subscription?.plan === 'basic' ? 50 : 5;

    if (activeListingsCount >= maxListings) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'LISTING_LIMIT_EXCEEDED',
          message: 'You have reached your listing limit'
        }
      }, { status: 403 });
    }

    // Generate unique slug
    const baseSlug = generateSlug(validatedData.title);
    let slug = baseSlug;
    let counter = 1;

    while (await Listing.findOne({ 'seo.slug': slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create listing
    const listing = await Listing.create({
      ...validatedData,
      seller: session.user.id,
      seo: {
        slug,
        metaTitle: validatedData.seo?.metaTitle,
        metaDescription: validatedData.seo?.metaDescription
      }
    });

    // Update category listing count
    await Category.findByIdAndUpdate(validatedData.category, {
      $inc: { listingCount: 1 }
    });

    // Update user stats
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { 
        'stats.totalListings': 1,
        'stats.activeListings': 1
      }
    });

    // Return created listing with populated data
    const populatedListing = await Listing.findById(listing._id)
      .populate('category', 'name slug')
      .populate('seller', 'name avatar stats location createdAt')
      .lean();

    if (!populatedListing || Array.isArray(populatedListing)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found after creation'
        }
      }, { status: 500 });
    }

    const response: ApiResponse<ListingDetail> = {
      success: true,
      data: {
        id: populatedListing.id.toString(),
        title: populatedListing.title,
        description: populatedListing.description,
        price: populatedListing.price,
        images: populatedListing.images,
        category: {
          id: populatedListing.category._id.toString(),
          name: populatedListing.category.name,
          slug: populatedListing.category.slug
        },
        condition: populatedListing.condition,
        seller: {
          id: populatedListing.seller._id.toString(),
          name: populatedListing.seller.name,
          avatar: populatedListing.seller.avatar,
          rating: populatedListing.seller.stats?.rating || 0,
          reviewCount: populatedListing.seller.stats?.reviewCount || 0,
          memberSince: populatedListing.seller.createdAt,
          location: {
            city: populatedListing.seller.location?.city || '',
            state: populatedListing.seller.location?.state || ''
          }
        },
        location: populatedListing.location,
        status: populatedListing.status,
        features: populatedListing.features,
        stats: populatedListing.stats,
        seo: populatedListing.seo,
        isOwner: true,
        expiresAt: populatedListing.expiresAt,
        createdAt: populatedListing.createdAt,
        updatedAt: populatedListing.updatedAt
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('POST /api/listings error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
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
        message: 'Failed to create listing'
      }
    }, { status: 500 });
  }
}