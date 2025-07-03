import Stripe from 'stripe';
import { env } from '../env';
import { generateInvoiceNumber } from '../utils';
import type { 
  CreatePayment, 
  SubscriptionPlan, 
  CheckoutSession,
  RefundRequest 
} from '../types';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true
});

class StripeService {
  /**
   * Create checkout session for one-time payment
   */
  async createCheckoutSession(
    payment: CreatePayment,
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession> {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: payment.amount.currency.toLowerCase(),
              product_data: {
                name: this.getProductName(payment.type, payment.metadata),
                description: this.getProductDescription(payment.type, payment.metadata)
              },
              unit_amount: Math.round(payment.amount.value * 100) // Convert to cents
            },
            quantity: 1
          }
        ],
        metadata: {
          userId,
          paymentType: payment.type,
          ...payment.metadata
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
      });

      return {
        sessionId: session.id,
        url: session.url!,
        expiresAt: new Date(session.expires_at * 1000)
      };
    } catch (error) {
      throw new Error(`Stripe checkout creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create subscription checkout session
   */
  async createSubscriptionCheckout(
    plan: SubscriptionPlan,
    userId: string,
    customerEmail: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession> {
    try {
      // Create or get customer
      const customer = await this.createOrGetCustomer(userId, customerEmail);

      // Create or get price
      const price = await this.createOrGetPrice(plan);

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customer.id,
        line_items: [
          {
            price: price.id,
            quantity: 1
          }
        ],
        metadata: {
          userId,
          plan: plan.name,
          interval: plan.price.interval
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          metadata: {
            userId,
            plan: plan.name
          }
        }
      });

      return {
        sessionId: session.id,
        url: session.url!,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      };
    } catch (error) {
      throw new Error(`Stripe subscription checkout creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process webhook event
   */
  async processWebhook(
    payload: string,
    signature: string
  ): Promise<Stripe.Event> {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(
    paymentIntentId: string,
    request: RefundRequest
  ): Promise<Stripe.Refund> {
    try {
      return await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: request.amount ? Math.round(request.amount * 100) : undefined,
        reason: 'requested_by_customer',
        metadata: {
          reason: request.reason,
          refundId: generateInvoiceNumber()
        }
      });
    } catch (error) {
      throw new Error(`Stripe refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    try {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd
      });
    } catch (error) {
      throw new Error(`Stripe subscription cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create or get customer
   */
  private async createOrGetCustomer(
    userId: string,
    email: string
  ): Promise<Stripe.Customer> {
    // Try to find existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return await stripe.customers.create({
      email,
      metadata: {
        userId
      }
    });
  }

  /**
   * Create or get price for subscription plan
   */
  private async createOrGetPrice(plan: SubscriptionPlan): Promise<Stripe.Price> {
    const lookupKey = `${plan.name}_${plan.price.interval}_${plan.price.currency}`;

    // Try to find existing price
    const existingPrices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      limit: 1
    });

    if (existingPrices.data.length > 0) {
      return existingPrices.data[0];
    }

    // Create product first
    const product = await stripe.products.create({
      name: `${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} Plan`,
      description: `${plan.name} subscription plan with ${plan.features.maxListings} listings`,
      metadata: {
        plan: plan.name
      }
    });

    // Create price
    return await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.price.amount * 100),
      currency: plan.price.currency.toLowerCase(),
      recurring: {
        interval: plan.price.interval === 'yearly' ? 'year' : 'month'
      },
      lookup_key: lookupKey
    });
  }

  /**
   * Get product name for checkout
   */
  private getProductName(type: string, metadata: any): string {
    switch (type) {
      case 'promotion':
        return `${metadata.promotionType?.charAt(0).toUpperCase() + metadata.promotionType?.slice(1)} Listing Promotion`;
      case 'subscription':
        return `${metadata.plan?.charAt(0).toUpperCase() + metadata.plan?.slice(1)} Subscription`;
      case 'featured_listing':
        return 'Featured Listing';
      default:
        return 'Marketplace Service';
    }
  }

  /**
   * Get product description for checkout
   */
  private getProductDescription(type: string, metadata: any): string {
    switch (type) {
      case 'promotion':
        return `Promote your listing for ${metadata.duration} days`;
      case 'subscription':
        return `Monthly subscription with enhanced features`;
      case 'featured_listing':
        return 'Feature your listing at the top of search results';
      default:
        return 'Marketplace service payment';
    }
  }
}

export const stripeService = new StripeService();
