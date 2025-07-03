// User server actions
'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '../db';
import { User } from '@/models';
import { updateUserProfileSchema } from '../validations';
import type { FormSubmissionResult } from '../types';

export async function updateUserProfileAction(
  formData: FormData,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string || undefined,
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
      preferences: {
        language: formData.get('language') as 'en' | 'id',
        currency: formData.get('currency') as 'USD' | 'IDR',
        theme: formData.get('theme') as 'light' | 'dark' | 'system',
        notifications: {
          email: formData.get('emailNotifications') === 'on',
          push: formData.get('pushNotifications') === 'on',
          sms: formData.get('smsNotifications') === 'on'
        }
      }
    };

    const validatedData = updateUserProfileSchema.parse(rawData);
    
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'User not found' }]
      };
    }

    // Check if phone number is already taken by another user
    if (validatedData.phone) {
      const existingUser = await User.findOne({
        phone: validatedData.phone,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return {
          success: false,
          errors: [{ field: 'phone', message: 'Phone number already in use' }]
        };
      }
    }

    await User.findByIdAndUpdate(userId, validatedData, { new: true });

    revalidatePath('/profile');
    revalidatePath('/profile/settings');

    return {
      success: true,
      data: { message: 'Profile updated successfully' }
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
      errors: [{ field: 'root', message: 'Profile update failed' }]
    };
  }
}

export async function updateUserAvatarAction(
  avatarUrl: string,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    await connectDB();

    await User.findByIdAndUpdate(userId, { avatar: avatarUrl });

    revalidatePath('/profile');

    return {
      success: true,
      data: { avatarUrl }
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Avatar update failed' }]
    };
  }
}

export async function deleteUserAccountAction(
  userId: string,
  password: string
): Promise<FormSubmissionResult> {
  try {
    await connectDB();

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'User not found' }]
      };
    }

    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        errors: [{ field: 'password', message: 'Password is incorrect' }]
      };
    }

    // TODO: Handle related data cleanup (listings, messages, etc.)
    await User.findByIdAndUpdate(userId, {
      status: 'banned',
      email: `deleted_${Date.now()}@deleted.com`,
      name: 'Deleted User'
    });

    return {
      success: true,
      redirect: '/auth/signin?message=account-deleted'
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Account deletion failed' }]
    };
  }
}
