// Listing server actions
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { connectDB } from '../db';
import { Listing, Category, User } from '@/models';
import { generateSlug } from '../utils';
import { 
  createListingSchema, 
  updateListingSchema, 
  promoteListingSchema 
} from '../validations';
import type { FormSubmissionResult } from '../types';

export async function createListingAction(
  formData: FormData,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    const images = formData.getAll('images') as string[];
    
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: {
        amount: Number(formData.get('priceAmount')),
        currency: formData.get('priceCurrency') as 'USD' | 'IDR',
        negotiable: formData.get('negotiable') === 'on'
      },
      category: formData.get('category') as string,
      condition: formData.get('condition') as string,
      images,
      location: {
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        country: formData.get('country') as string,
        coordinates: {
          latitude: Number(formData.get('latitude')),
          longitude: Number(formData.get('longitude'))
        }
      },
      seo: {
        metaTitle: formData.get('metaTitle') as string || undefined,
        metaDescription: formData.get('metaDescription') as string || undefined
      }
    };

    const validatedData = createListingSchema.parse(rawData);
    
    await connectDB();

    // Verify category exists
    const category = await Category.findById(validatedData.category);
    if (!category || !category.isActive) {
      return {
        success: false,
        errors: [{ field: 'category', message: 'Invalid category' }]
      };
    }

    // Check user's listing limits
    const user = await User.findById(userId);
    const activeListingsCount = await Listing.countDocuments({
      seller: userId,
      status: 'active'
    });

    const maxListings = user?.subscription?.plan === 'premium' ? 200 : 
                       user?.subscription?.plan === 'basic' ? 50 : 5;

    if (activeListingsCount >= maxListings) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'You have reached your listing limit' }]
      };
    }

    // Generate unique slug
    const baseSlug = generateSlug(validatedData.title);
    let slug = baseSlug;
    let counter = 1;

    while (await Listing.findOne({ 'seo.slug': slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const listing = await Listing.create({
      ...validatedData,
      seller: userId,
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
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        'stats.totalListings': 1,
        'stats.activeListings': 1
      }
    });

    revalidatePath('/listings');
    revalidatePath('/profile/listings');

    return {
      success: true,
      redirect: `/listings/${listing._id}`
    };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }

    return {
      success: false,
      errors: [{ field: 'root', message: 'Listing creation failed' }]
    };
  }
}

export async function updateListingAction(
  formData: FormData,
  listingId: string,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    const images = formData.getAll('images') as string[];
    
    const rawData = {
      id: listingId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: {
        amount: Number(formData.get('priceAmount')),
        currency: formData.get('priceCurrency') as 'USD' | 'IDR',
        negotiable: formData.get('negotiable') === 'on'
      },
      category: formData.get('category') as string,
      condition: formData.get('condition') as string,
      images,
      location: {
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        country: formData.get('country') as string,
        coordinates: {
          latitude: Number(formData.get('latitude')),
          longitude: Number(formData.get('longitude'))
        }
      }
    };

    const validatedData = updateListingSchema.parse(rawData);
    
    await connectDB();

    const listing = await Listing.findOne({
      _id: listingId,
      seller: userId
    });

    if (!listing) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Listing not found or access denied' }]
      };
    }

    await Listing.findByIdAndUpdate(listingId, validatedData);

    revalidatePath(`/listings/${listingId}`);
    revalidatePath('/profile/listings');

    return {
      success: true,
      data: { message: 'Listing updated successfully' }
    };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }

    return {
      success: false,
      errors: [{ field: 'root', message: 'Listing update failed' }]
    };
  }
}

export async function deleteListingAction(
  listingId: string,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    await connectDB();

    const listing = await Listing.findOne({
      _id: listingId,
      seller: userId
    });

    if (!listing) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Listing not found or access denied' }]
      };
    }

    await Listing.findByIdAndDelete(listingId);

    // Update category listing count
    await Category.findByIdAndUpdate(listing.category, {
      $inc: { listingCount: -1 }
    });

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        'stats.totalListings': -1,
        'stats.activeListings': listing.status === 'active' ? -1 : 0
      }
    });

    revalidatePath('/listings');
    revalidatePath('/profile/listings');

    return {
      success: true,
      redirect: '/profile/listings'
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Listing deletion failed' }]
    };
  }
}

export async function markListingAsSoldAction(
  listingId: string,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    await connectDB();

    const listing = await Listing.findOne({
      _id: listingId,
      seller: userId,
      status: 'active'
    });

    if (!listing) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Listing not found or already sold' }]
      };
    }

    await Listing.findByIdAndUpdate(listingId, { status: 'sold' });

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 
        'stats.activeListings': -1,
        'stats.soldListings': 1
      }
    });

    revalidatePath(`/listings/${listingId}`);
    revalidatePath('/profile/listings');

    return {
      success: true,
      data: { message: 'Listing marked as sold' }
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Failed to mark listing as sold' }]
    };
  }
}

export async function toggleFavoriteAction(
  listingId: string,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    await connectDB();

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Listing not found' }]
      };
    }

    // TODO: Implement favorites collection/model
    // For now, just update listing stats
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { 'stats.favorites': 1 }
    });

    revalidatePath(`/listings/${listingId}`);

    return {
      success: true,
      data: { message: 'Favorite toggled' }
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Failed to toggle favorite' }]
    };
  }
}