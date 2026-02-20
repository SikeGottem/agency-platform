import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { stripe, WEBHOOK_EVENTS, WebhookEventType, getPlanTierFromPriceId } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Only process events we care about
  if (!WEBHOOK_EVENTS.includes(event.type as WebhookEventType)) {
    console.log(`Ignoring unhandled event type: ${event.type}`);
    return NextResponse.json({ received: true });
  }

  console.log(`Processing webhook event: ${event.type}`);

  try {
    const supabase = createAdminClient();

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get the customer
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer || customer.deleted) {
          console.error('Customer not found for subscription:', subscription.id);
          break;
        }

        const customerId = customer.id;
        const supabaseUserId = customer.metadata?.supabase_user_id;

        if (!supabaseUserId) {
          console.error('No Supabase user ID in customer metadata');
          break;
        }

        // Get the price ID from the subscription
        const priceId = subscription.items.data[0]?.price?.id;
        if (!priceId) {
          console.error('No price ID found in subscription');
          break;
        }

        const planTier = getPlanTierFromPriceId(priceId);
        const isActive = subscription.status === 'active';

        // Update user's subscription status
        const { error } = await supabase
          .from('profiles')
          .update({
            plan_tier: isActive ? planTier : 'free',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', supabaseUserId);

        if (error) {
          console.error('Failed to update user subscription:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log(`Updated subscription for user ${supabaseUserId} to ${planTier} (${subscription.status})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get the customer
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer || customer.deleted) {
          console.error('Customer not found for subscription:', subscription.id);
          break;
        }

        const supabaseUserId = customer.metadata?.supabase_user_id;

        if (!supabaseUserId) {
          console.error('No Supabase user ID in customer metadata');
          break;
        }

        // Downgrade user to free tier
        const { error } = await supabase
          .from('profiles')
          .update({
            plan_tier: 'free',
            subscription_status: 'cancelled',
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', supabaseUserId);

        if (error) {
          console.error('Failed to downgrade user subscription:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log(`Downgraded user ${supabaseUserId} to free tier`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          
          if (!customer || customer.deleted) {
            console.error('Customer not found for invoice:', invoice.id);
            break;
          }

          const supabaseUserId = customer.metadata?.supabase_user_id;

          if (!supabaseUserId) {
            console.error('No Supabase user ID in customer metadata');
            break;
          }

          // Update subscription period end date
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', supabaseUserId);

          if (error) {
            console.error('Failed to update subscription period:', error);
          } else {
            console.log(`Updated subscription period for user ${supabaseUserId}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          
          if (!customer || customer.deleted) {
            console.error('Customer not found for invoice:', invoice.id);
            break;
          }

          const supabaseUserId = customer.metadata?.supabase_user_id;

          if (!supabaseUserId) {
            console.error('No Supabase user ID in customer metadata');
            break;
          }

          // Mark subscription as having payment issues
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', supabaseUserId);

          if (error) {
            console.error('Failed to update subscription status after failed payment:', error);
          } else {
            console.log(`Updated subscription status for user ${supabaseUserId} after payment failure`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}