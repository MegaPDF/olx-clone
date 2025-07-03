import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment, User, Listing } from '@/models';
import { generateRandomString } from '@/lib/utils';
import { env } from '@/lib/env';

// POST /api/payments/webhook - Handle payment provider webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Missing webhook signature'
        }
      }, { status: 400 });
    }

    // TODO: Verify webhook signature with Stripe
    // For now, parse the webhook payload
    const event = JSON.parse(body);

    await connectDB();

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'WEBHOOK_ERROR',
        message: 'Webhook processing failed'
      }
    }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const payment = await Payment.findOne({
      paymentIntentId: paymentIntent.id
    });

    if (!payment) {
      console.error('Payment not found for intent:', paymentIntent.id);
      return;
    }

    // Update payment status
    await Payment.findByIdAndUpdate(payment._id, {
      status: 'completed',
      transactionId: paymentIntent.charges.data[0]?.id,
      completedAt: new Date(),
      metadata: {
        ...payment.metadata,
        stripePaymentIntent: paymentIntent
      }
    });

    // Handle different payment types
    switch (payment.type) {
      case 'promotion':
        await handlePromotionPayment(payment);
        break;
      
      case 'subscription':
        await handleSubscriptionUpgrade(payment);
        break;
      
      case 'featured_listing':
        await handleFeaturedListing(payment);
        break;
    }

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    await Payment.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      {
        status: 'failed',
        metadata: {
          error: paymentIntent.last_payment_error
        }
      }
    );
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePromotionPayment(payment: any) {
  if (!payment.listing) return;

  const promotionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
  const expiresAt = new Date(Date.now() + promotionDuration);

  await Listing.findByIdAndUpdate(payment.listing, {
    'features.promoted.isPromoted': true,
    'features.promoted.expiresAt': expiresAt,
    'features.promoted.type': 'featured'
  });
}

async function handleSubscriptionUpgrade(payment: any) {
  const plan = payment.metadata?.plan || 'basic';
  const duration = payment.metadata?.duration || 'monthly';
  
  const expiresAt = new Date();
  if (duration === 'yearly') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  await User.findByIdAndUpdate(payment.user, {
    'subscription.plan': plan,
    'subscription.status': 'active',
    'subscription.expiresAt': expiresAt
  });
}

async function handleFeaturedListing(payment: any) {
  if (!payment.listing) return;

  const featuredDuration = 30 * 24 * 60 * 60 * 1000; // 30 days
  const expiresAt = new Date(Date.now() + featuredDuration);

  await Listing.findByIdAndUpdate(payment.listing, {
    'features.featured.isFeatured': true,
    'features.featured.expiresAt': expiresAt
  });
}

async function handleSubscriptionPayment(invoice: any) {
  // Handle recurring subscription payments
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;

  // Find user by Stripe customer ID
  const user = await User.findOne({ 'stripe.customerId': customerId });
  if (!user) return;

  // Update subscription status
  await User.findByIdAndUpdate(user._id, {
    'subscription.status': 'active',
    'subscription.lastPaymentAt': new Date()
  });
}