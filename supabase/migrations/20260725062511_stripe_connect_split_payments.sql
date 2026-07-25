-- ============ Stripe Connect split payments ============
-- Each manufacturer gets their own Stripe Standard connected account.
-- At checkout, the platform charges the customer and Stripe automatically
-- splits the payment: application_fee_amount goes to the platform, the
-- remainder transfers to the manufacturer's connected account.
ALTER TABLE public.manufacturers
  ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  -- Stored per-manufacturer (even though every manufacturer currently uses
  -- the same 10% default) so a future per-manufacturer rate doesn't need
  -- another migration - just update this column for that one row.
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.10;

-- Record what commission was actually applied on each order, for admin
-- visibility/bookkeeping - this can differ from the manufacturer's current
-- commission_rate if that rate changes after the order was placed.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS platform_fee_cents INTEGER;
