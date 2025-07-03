// Auth server actions
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { signIn, signOut } from '../auth';
import { connectDB } from '../db';
import { User } from '@/models';
import { generateRandomString } from '../utils';
import { 
  signInSchema, 
  signUpSchema, 
  resetPasswordSchema, 
  newPasswordSchema,
  changePasswordSchema,
  emailVerificationSchema
} from '../validations';
import type { FormSubmissionResult } from '../types';

export async function signInAction(
  formData: FormData
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      remember: formData.get('remember') === 'on'
    };

    const validatedData = signInSchema.parse(rawData);

    const result = await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false
    });

    if (result?.error) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Invalid credentials' }]
      };
    }

    return {
      success: true,
      redirect: '/'
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: error.message || 'Sign in failed' }]
    };
  }
}

export async function signUpAction(
  formData: FormData
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
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
      acceptTerms: formData.get('acceptTerms') === 'on',
      newsletter: formData.get('newsletter') === 'on'
    };

    const validatedData = signUpSchema.parse(rawData);
    
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return {
        success: false,
        errors: [{ field: 'email', message: 'Email already exists' }]
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Generate email verification token
    const verificationToken = generateRandomString(32);

    // Create user
    await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      location: validatedData.location,
      verification: {
        email: {
          verified: false,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      }
    });

    // TODO: Send verification email
    // await sendVerificationEmail(validatedData.email, verificationToken);

    return {
      success: true,
      redirect: '/auth/verify-email?email=' + encodeURIComponent(validatedData.email)
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
      errors: [{ field: 'root', message: error.message || 'Registration failed' }]
    };
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect('/');
}

export async function resetPasswordAction(
  formData: FormData
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      email: formData.get('email') as string
    };

    const validatedData = resetPasswordSchema.parse(rawData);
    
    await connectDB();

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        success: true,
        data: { message: 'If the email exists, a reset link has been sent' }
      };
    }

    // Generate reset token
    const resetToken = generateRandomString(32);
    
    await User.findByIdAndUpdate(user._id, {
      'verification.email.token': resetToken,
      'verification.email.expiresAt': new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    // TODO: Send password reset email
    // await sendPasswordResetEmail(validatedData.email, resetToken);

    return {
      success: true,
      data: { message: 'If the email exists, a reset link has been sent' }
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Password reset failed' }]
    };
  }
}

export async function newPasswordAction(
  formData: FormData
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      token: formData.get('token') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string
    };

    const validatedData = newPasswordSchema.parse(rawData);
    
    await connectDB();

    const user = await User.findOne({
      'verification.email.token': validatedData.token,
      'verification.email.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return {
        success: false,
        errors: [{ field: 'token', message: 'Invalid or expired token' }]
      };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      'verification.email.token': undefined,
      'verification.email.expiresAt': undefined
    });

    return {
      success: true,
      redirect: '/auth/signin?message=password-updated'
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
      errors: [{ field: 'root', message: 'Password update failed' }]
    };
  }
}

export async function verifyEmailAction(
  token: string
): Promise<FormSubmissionResult> {
  try {
    const validatedData = emailVerificationSchema.parse({ token });
    
    await connectDB();

    const user = await User.findOne({
      'verification.email.token': validatedData.token,
      'verification.email.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return {
        success: false,
        errors: [{ field: 'token', message: 'Invalid or expired verification token' }]
      };
    }

    await User.findByIdAndUpdate(user._id, {
      'verification.email.verified': true,
      'verification.email.token': undefined,
      'verification.email.expiresAt': undefined
    });

    return {
      success: true,
      redirect: '/auth/signin?message=email-verified'
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Email verification failed' }]
    };
  }
}

export async function changePasswordAction(
  formData: FormData,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string
    };

    const validatedData = changePasswordSchema.parse(rawData);
    
    await connectDB();

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'User not found' }]
      };
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        errors: [{ field: 'currentPassword', message: 'Current password is incorrect' }]
      };
    }

    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword
    });

    revalidatePath('/profile/settings');

    return {
      success: true,
      data: { message: 'Password updated successfully' }
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
      errors: [{ field: 'root', message: 'Password change failed' }]
    };
  }
}