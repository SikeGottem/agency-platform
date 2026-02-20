import Stripe from 'stripe';
import { PlanTier } from '@/types';

// Initialize Stripe client
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  : null;

// Plan configuration
export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    priceId: null, // No Stripe price for free tier
    features: [
      '3 client projects',
      'Basic templates',
      'Email support',
      'Standard branding',
    ],
    limits: {
      projects: 3,
      templates: false,
      multiUser: false,
      analytics: false,
    },
  },
  pro: {
    name: 'Pro',
    description: 'For growing agencies',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Unlimited projects',
      'Premium templates',
      'Priority support',
      'Custom branding',
      'Advanced questionnaires',
    ],
    limits: {
      projects: Infinity,
      templates: true,
      multiUser: false,
      analytics: false,
    },
  },
  team: {
    name: 'Team',
    description: 'For larger teams and agencies',
    price: 99,
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    features: [
      'Everything in Pro',
      'Multi-user collaboration',
      'Advanced analytics',
      'White-label options',
      'Dedicated support',
    ],
    limits: {
      projects: Infinity,
      templates: true,
      multiUser: true,
      analytics: true,
    },
  },
} as const;

// Helper function to get plan details
export function getPlanDetails(tier: PlanTier) {
  return PLAN_CONFIG[tier as keyof typeof PLAN_CONFIG];
}

// Helper function to check if a plan has a feature
export function hasFeature(tier: PlanTier, feature: keyof typeof PLAN_CONFIG.free.limits) {
  return PLAN_CONFIG[tier as keyof typeof PLAN_CONFIG].limits[feature];
}

// Helper function to create a checkout session
export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  customerId,
  metadata = {},
}: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      metadata,
      subscription_data: {
        metadata,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: customerId ? {
        address: 'auto',
        name: 'auto',
      } : undefined,
    });

    return { session, error: null };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { 
      session: null, 
      error: error instanceof Error ? error.message : 'Failed to create checkout session' 
    };
  }
}

// Helper function to create a customer portal session
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { session, error: null };
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return {
      session: null,
      error: error instanceof Error ? error.message : 'Failed to create customer portal session',
    };
  }
}

// Helper function to retrieve a customer by email
export async function findCustomerByEmail(email: string) {
  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    return customers.data[0] || null;
  } catch (error) {
    console.error('Error finding customer by email:', error);
    return null;
  }
}

// Helper function to create a customer
export async function createCustomer({
  email,
  name,
  metadata = {},
}: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return { customer, error: null };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      customer: null,
      error: error instanceof Error ? error.message : 'Failed to create customer',
    };
  }
}

// Helper function to get subscription details
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method'],
    });

    return { subscription, error: null };
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return {
      subscription: null,
      error: error instanceof Error ? error.message : 'Failed to retrieve subscription',
    };
  }
}

// Helper function to determine plan tier from Stripe price ID
export function getPlanTierFromPriceId(priceId: string): PlanTier {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return 'pro';
  }
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
    return 'team';
  }
  return 'free';
}

// Webhook event types we care about
export const WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
] as const;

export type WebhookEventType = typeof WEBHOOK_EVENTS[number];