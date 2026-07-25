import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequestHost } from "@tanstack/react-start/server";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string }) => {
    if (!data?.orderId || typeof data.orderId !== "string") {
      throw new Error("orderId is required");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");
    }

    // Fetch the order as the authenticated user (RLS enforces ownership)
    const { data: order, error } = await context.supabase
      .from("orders")
      .select(
        "id, customer_id, manufacturer_id, product_type, quantity, total_cents, currency, payment_status, stripe_session_id, status",
      )
      .eq("id", data.orderId)
      .single();

    if (error || !order) throw new Error("Order not found");
    if (order.customer_id !== context.userId) throw new Error("Forbidden");
    if (order.payment_status === "paid") throw new Error("Order is already paid");
    if (!order.total_cents || order.total_cents <= 0) throw new Error("Order total is invalid");
    if (order.status !== "manufacturer_confirmed") {
      throw new Error("This order hasn't been confirmed by the manufacturer yet");
    }
    if (!order.manufacturer_id) throw new Error("Order has no manufacturer assigned");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: manufacturer, error: manufacturerError } = await supabaseAdmin
      .from("manufacturers")
      .select("stripe_account_id, stripe_onboarding_complete, commission_rate")
      .eq("id", order.manufacturer_id)
      .single();
    if (manufacturerError || !manufacturer) throw new Error("Manufacturer not found");
    if (!manufacturer.stripe_account_id || !manufacturer.stripe_onboarding_complete) {
      throw new Error(
        "This manufacturer hasn't finished setting up payments yet. Please try again later.",
      );
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-04-30.basil" as any });

    const host = getRequestHost();
    const origin = `https://${host}`;
    const currency = (order.currency || "kes").toLowerCase();
    const commissionRate = manufacturer.commission_rate ?? 0.1;
    const applicationFeeAmount = Math.round(order.total_cents * commissionRate);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Custom ${order.product_type} order`,
              description: `Order #${order.id.slice(0, 8)} • Qty ${order.quantity}`,
            },
            unit_amount: Math.round(order.total_cents / order.quantity),
          },
          quantity: order.quantity,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: manufacturer.stripe_account_id,
        },
      },
      client_reference_id: order.id,
      metadata: { order_id: order.id, customer_id: order.customer_id },
      success_url: `${origin}/payment-success?order_id=${order.id}`,
      cancel_url: `${origin}/payment-cancelled?order_id=${order.id}`,
    });

    // Persist session id via admin client (customers cannot update this field)
    await supabaseAdmin
      .from("orders")
      .update({
        stripe_session_id: session.id,
        payment_status: "awaiting_payment",
        platform_fee_cents: applicationFeeAmount,
      })
      .eq("id", order.id);

    return { url: session.url, sessionId: session.id };
  });
