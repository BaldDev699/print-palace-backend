-- ============ Order quotation workflow fields ============
-- Supports the manufacturer feasibility review step: an order is
-- submitted (status='pending'), the manufacturer reviews and either
-- confirms (status='manufacturer_confirmed', unlocking payment) or
-- declines (status='manufacturer_declined'), and later marks the
-- finished order 'completed' with delivery notes for the customer.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS manufacturer_notes TEXT,
  ADD COLUMN IF NOT EXISTS decline_reason TEXT,
  ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
  ADD COLUMN IF NOT EXISTS manufacturer_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS manufacturer_declined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ============ Notification log ============
-- Stub for the eventual email system (quote ready, payment reminder,
-- order completed, etc). Every notification "send" is logged here so
-- the workflow can be built and tested end-to-end before a real email
-- provider (Resend/SendGrid/Postmark) is wired in. Swap the sending
-- implementation in src/lib/notifications.functions.ts without needing
-- another migration.
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  recipient_email TEXT,
  payload JSONB,
  sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notification_log TO authenticated;
GRANT ALL ON public.notification_log TO service_role;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order participants can view notification log" ON public.notification_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = notification_log.order_id
        AND (
          o.customer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.manufacturers m
            WHERE m.user_id = auth.uid() AND m.id = o.manufacturer_id
          )
        )
    )
  );
