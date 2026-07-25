import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequestHost } from "@tanstack/react-start/server";

async function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");
  }
  const Stripe = (await import("stripe")).default;
  return new Stripe(stripeKey, { apiVersion: "2025-04-30.basil" as any });
}

async function getOwnManufacturer(context: { userId: string; supabase: any }) {
  const { data: manufacturer, error } = await context.supabase
    .from("manufacturers")
    .select("id, contact_email, stripe_account_id, stripe_onboarding_complete")
    .eq("user_id", context.userId)
    .single();
  if (error || !manufacturer) {
    console.error("getOwnManufacturer failed:", error);
    throw new Error(
      error?.message
        ? `Could not load your manufacturer profile: ${error.message}`
        : "No manufacturer profile found for this account",
    );
  }
  return manufacturer;
}

// Creates (if needed) a Stripe Standard connected account for the logged-in
// manufacturer and returns a one-time onboarding link to send them to.
export const createConnectOnboardingLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const stripe = await getStripe();
    const manufacturer = await getOwnManufacturer(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let accountId = manufacturer.stripe_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        email: manufacturer.contact_email || undefined,
      });
      accountId = account.id;
      await supabaseAdmin
        .from("manufacturers")
        .update({ stripe_account_id: accountId })
        .eq("id", manufacturer.id);
    }

    const host = getRequestHost();
    const origin = `https://${host}`;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/manufacturer/payments`,
      return_url: `${origin}/manufacturer/payments`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  });

// Checks the connected account's actual status with Stripe and syncs
// stripe_onboarding_complete accordingly (Stripe is the source of truth -
// onboarding can be completed/interrupted outside our app).
export const getConnectAccountStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const manufacturer = await getOwnManufacturer(context);
    if (!manufacturer.stripe_account_id) {
      return { connected: false, chargesEnabled: false, detailsSubmitted: false };
    }

    const stripe = await getStripe();
    const account = await stripe.accounts.retrieve(manufacturer.stripe_account_id);
    const chargesEnabled = !!account.charges_enabled;
    const detailsSubmitted = !!account.details_submitted;

    if (chargesEnabled !== manufacturer.stripe_onboarding_complete) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("manufacturers")
        .update({ stripe_onboarding_complete: chargesEnabled })
        .eq("id", manufacturer.id);
    }

    return { connected: true, chargesEnabled, detailsSubmitted };
  });
