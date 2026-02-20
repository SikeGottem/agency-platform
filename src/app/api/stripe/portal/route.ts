import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createCustomerPortalSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with Stripe customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.stripe_customer_id) {
      return NextResponse.json({ 
        error: "No subscription found. Please subscribe to a plan first." 
      }, { status: 400 });
    }

    // Create customer portal session
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;
    const { session, error } = await createCustomerPortalSession({
      customerId: profile.stripe_customer_id,
      returnUrl: `${baseUrl}/dashboard`,
    });

    if (error || !session) {
      console.error('Failed to create customer portal session:', error);
      return NextResponse.json({ 
        error: "Failed to create customer portal session" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      portalUrl: session.url 
    });

  } catch (error) {
    console.error("Customer portal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}