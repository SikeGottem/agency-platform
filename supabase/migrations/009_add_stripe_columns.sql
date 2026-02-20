-- ============================================
-- 009_add_stripe_columns.sql
-- Add Stripe integration columns to profiles table
-- ============================================

-- Add Stripe-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid', 'paused', 'cancelled')),
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Add index for faster lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Add index for faster lookups by subscription status
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- Comments for clarity
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN public.profiles.subscription_current_period_end IS 'When current subscription period ends';