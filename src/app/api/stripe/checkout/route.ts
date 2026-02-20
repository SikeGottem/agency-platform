import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { 
  createCheckoutSession, 
  createCustomer, 
  findCustomerByEmail, 
  PLAN_CONFIG 
} from "@/lib/stripe";
import { PlanTier } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planTier }: { planTier: PlanTier } = body;

    // Validate plan tier
    if (!planTier || !PLAN_CONFIG[planTier]) {
      return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
    }

    // Free tier doesn't need checkout
    if (planTier === 'free') {
      return NextResponse.json({ error: "Free tier doesn't require checkout" }, { status: 400 });
    }

    const plan = PLAN_CONFIG[planTier];
    
    if (!plan.priceId) {
      return NextResponse.json({ error: "Price ID not configured for this plan" }, { status: 500 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    let customerId = profile.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      // First check if customer exists in Stripe by email
      const existingCustomer = await findCustomerByEmail(profile.email);
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { customer, error } = await createCustomer({
          email: profile.email,
          name: profile.full_name || undefined,
          metadata: {
            supabase_user_id: user.id,
          },
        });

        if (error || !customer) {
          console.error('Failed to create Stripe customer:', error);
          return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
        }

        customerId = customer.id;
      }

      // Update profile with Stripe customer ID
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Create checkout session
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;
    const { session, error } = await createCheckoutSession({
      priceId: plan.priceId,
      successUrl: `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/dashboard?checkout=cancelled`,
      customerId,
      metadata: {
        supabase_user_id: user.id,
        plan_tier: planTier,
      },
    });

    if (error || !session) {
      console.error('Failed to create checkout session:', error);
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ 
      checkoutUrl: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}