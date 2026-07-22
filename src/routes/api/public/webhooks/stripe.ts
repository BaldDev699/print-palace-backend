import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!stripeKey || !webhookSecret) {
          console.error("Stripe webhook: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
          return new Response("Stripe not configured", { status: 500 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing signature", { status: 400 });

        const rawBody = await request.text();

        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-04-30.basil" as any });

        let event: any;
        try {
          event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
        } catch (err: any) {
          console.error("Stripe webhook signature verification failed:", err.message);
          return new Response(`Invalid signature: ${err.message}`, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        try {
          switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded": {
              const session = event.data.object;
              const orderId = session.client_reference_id ?? session.metadata?.order_id;
              if (orderId) {
                await supabaseAdmin
                  .from("orders")
                  .update({
                    payment_status: "paid",
                    paid_at: new Date().toISOString(),
                    status: "confirmed",
                    stripe_session_id: session.id,
                  })
                  .eq("id", orderId);
              }
              break;
            }
            case "checkout.session.async_payment_failed":
            case "checkout.session.expired": {
              const session = event.data.object;
              const orderId = session.client_reference_id ?? session.metadata?.order_id;
              if (orderId) {
                await supabaseAdmin
                  .from("orders")
                  .update({ payment_status: "failed" })
                  .eq("id", orderId);
              }
              break;
            }
            default:
              break;
          }
        } catch (err: any) {
          console.error("Stripe webhook handler error:", err);
          return new Response(`Handler error: ${err.message}`, { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
