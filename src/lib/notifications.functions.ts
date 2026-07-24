import { createServerFn } from "@tanstack/react-start";

/**
 * Order lifecycle events that should notify someone by email.
 *
 * Sends via Resend if RESEND_API_KEY is set; falls back to logging (and
 * still recording to notification_log) if it's not configured, so the
 * workflow keeps working end-to-end either way.
 */
export type OrderNotificationEvent =
  // New order submitted -> notify the manufacturer to review feasibility
  | "order_submitted"
  // Manufacturer confirmed feasibility -> notify the customer to pay
  | "quote_ready"
  // Manufacturer declined the order -> notify the customer
  | "order_declined"
  // Manufacturer marked the order complete -> notify the customer with
  // delivery details
  | "order_completed";

async function sendEmail(params: {
  to: string | null | undefined;
  event: OrderNotificationEvent;
  subject: string;
  body: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !params.to) {
    // No provider configured yet, or no recipient on file - log instead of
    // silently failing so the workflow keeps working end-to-end.
    console.log(`[stub email] to=${params.to ?? "unknown"} event=${params.event}`, params.subject);
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    // No custom domain verified yet - Resend's shared test sender only
    // delivers to the account's own verified email. Swap this "from" once
    // a domain (e.g. orders@rogeprint.com) is verified in the Resend
    // dashboard - no other code needs to change.
    const from = process.env.RESEND_FROM_EMAIL || "Roge Print Studio <onboarding@resend.dev>";
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: `<p>${params.body}</p>`,
    });
    if (error) {
      console.error(`[email] Resend error for event=${params.event}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] Failed to send for event=${params.event}:`, err);
    return false;
  }
}

const EVENT_COPY: Record<
  OrderNotificationEvent,
  (orderId: string) => { subject: string; body: string }
> = {
  order_submitted: (orderId) => ({
    subject: `New order #${orderId.slice(0, 8)} awaiting your review`,
    body: `A customer submitted a new order. Review the design and quantity, then confirm feasibility or decline from your manufacturer dashboard.`,
  }),
  quote_ready: (orderId) => ({
    subject: `Your order #${orderId.slice(0, 8)} is confirmed — proceed to payment`,
    body: `The manufacturer has reviewed your order and confirmed it's feasible. You can now pay to start production.`,
  }),
  order_declined: (orderId) => ({
    subject: `Update on your order #${orderId.slice(0, 8)}`,
    body: `Unfortunately the manufacturer was unable to take on this order. Check your order details for the reason, or submit it to a different manufacturer.`,
  }),
  order_completed: (orderId) => ({
    subject: `Your order #${orderId.slice(0, 8)} is complete`,
    body: `Production is finished. Check your order details for delivery information from the manufacturer.`,
  }),
};

export const notifyOrderEvent = createServerFn({ method: "POST" })
  .inputValidator((data: { orderId: string; event: OrderNotificationEvent }) => {
    if (!data?.orderId || typeof data.orderId !== "string") {
      throw new Error("orderId is required");
    }
    if (!data?.event) {
      throw new Error("event is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, customer_id, manufacturer_id")
      .eq("id", data.orderId)
      .single();
    if (error || !order) throw new Error("Order not found");

    // Figure out who should receive this notification.
    let recipientEmail: string | null = null;
    if (data.event === "order_submitted" && order.manufacturer_id) {
      const { data: manufacturer } = await supabaseAdmin
        .from("manufacturers")
        .select("contact_email")
        .eq("id", order.manufacturer_id)
        .single();
      recipientEmail = manufacturer?.contact_email ?? null;
    } else {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", order.customer_id)
        .single();
      recipientEmail = (profile as any)?.email ?? null;
    }

    const { subject, body } = EVENT_COPY[data.event](order.id);
    const sent = await sendEmail({ to: recipientEmail, event: data.event, subject, body });

    await supabaseAdmin.from("notification_log").insert({
      order_id: order.id,
      event_type: data.event,
      recipient_email: recipientEmail,
      payload: { subject, body },
      sent,
    });

    return { sent, recipientEmail };
  });
