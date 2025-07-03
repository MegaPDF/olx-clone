// Payment server actions
'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '../db';
import { Payment, Subscription, Listing, User } from '@/models';
import { generateInvoiceNumber } from '../utils';
import { 
  createPaymentSchema, 
  subscriptionPlanSchema, 
  promoteListingSchema 
} from '../validations';
import type { FormSubmissionResult } from '../types';

export async function createPromotionPaymentAction(
  formData: FormData,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      listingId: formData.get('listingId') as string,
      type: formData.get('type') as 'featured' | 'urgent' | 'highlight',
      duration: Number(formData.get('duration'))
    };

    const validatedData = promoteListingSchema.parse(rawData);
    
    await connectDB();

    // Verify listing ownership
    const listing = await Listing.findOne({
      _id: validatedData.listingId,
      seller: userId,
      status: 'active'
    });

    if (!listing) {
      return {
        success: false,
        errors: [{ field: 'listingId', message: 'Listing not found or access denied' }]
      };
    }

    // Get pricing from admin settings (simplified for now)
    const pricing = {
      featured: { price: 5, duration: 7 },
      urgent: { price: 3, duration: 3 },
      highlight: { price: 2, duration: 7 }
    };

    const promotionPrice = pricing[validatedData.type];

    const payment = await Payment.create({
      user: userId,
      type: 'promotion',
      amount: {
        value: promotionPrice.price,
        currency: 'USD'
      },
      status: 'pending',
      provider: {
        name: 'stripe',
        transactionId: `temp_${Date.now()}`
      },
      metadata: {
        listingId: validatedData.listingId,
        promotionType: validatedData.type,
        duration: validatedData.duration
      },
      invoice: {
        number: generateInvoiceNumber()
      }
    });

    // TODO: Create Stripe checkout session
    // const session = await stripe.checkout.sessions.create({...});

    return {
      success: true,
      data: { 
        paymentId: payment._id,
        checkoutUrl: `/checkout/${payment._id}` // Temporary
      }
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
      errors: [{ field: 'root', message: 'Payment creation failed' }]
    };
  }
}

export async function createSubscriptionPaymentAction(
  formData: FormData,
  userId: string
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      plan: formData.get('plan') as 'basic' | 'premium',
      interval: formData.get('interval') as 'monthly' | 'yearly'
    };

    const validatedData = subscriptionPlanSchema.parse(rawData);
    
    await connectDB();

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    if (existingSubscription) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'You already have an active subscription' }]
      };
    }

    // Get pricing (simplified)
    const pricing = {
      basic: { monthly: 9.99, yearly: 99.99 },
      premium: { monthly: 19.99, yearly: 199.99 }
    };

    const amount = pricing[validatedData.plan][validatedData.interval];

    const payment = await Payment.create({
      user: userId,
      type: 'subscription',
      amount: {
        value: amount,
        currency: 'USD'
      },
      status: 'pending',
      provider: {
        name: 'stripe',
        transactionId: `temp_${Date.now()}`
      },
      metadata: {
        subscriptionPlan: validatedData.plan,
        interval: validatedData.interval
      },
      invoice: {
        number: generateInvoiceNumber()
      }
    });

    // TODO: Create Stripe subscription
    // const subscription = await stripe.subscriptions.create({...});

    return {
      success: true,
      data: { 
        paymentId: payment._id,
        checkoutUrl: `/checkout/${payment._id}`
      }
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
      errors: [{ field: 'root', message: 'Subscription creation failed' }]
    };
  }
}

export async function cancelSubscriptionAction(
  userId: string
): Promise<FormSubmissionResult> {
  try {
    await connectDB();

    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    if (!subscription) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'No active subscription found' }]
      };
    }

    // TODO: Cancel Stripe subscription
    // await stripe.subscriptions.update(subscription.billing.stripeSubscriptionId, {
    //   cancel_at_period_end: true
    // });

    await Subscription.findByIdAndUpdate(subscription._id, {
      'billing.cancelAtPeriodEnd': true,
      status: 'cancelled'
    });

    revalidatePath('/profile/subscription');

    return {
      success: true,
      data: { message: 'Subscription cancelled successfully' }
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Subscription cancellation failed' }]
    };
  }
}
