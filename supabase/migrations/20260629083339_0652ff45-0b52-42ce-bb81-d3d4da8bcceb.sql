
-- 1 & 2: Revoke direct execute on SECURITY DEFINER functions that should not be publicly callable
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_roge_balance(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_pending_withdrawals(uuid) FROM anon, authenticated;

-- 3: Restrict manufacturers SELECT to the owner only (contact info no longer exposed to order counterparties)
DROP POLICY IF EXISTS "Owners and order counterparties can view manufacturers" ON public.manufacturers;
CREATE POLICY "Owners can view their own manufacturer profile"
ON public.manufacturers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4: Prevent customers from modifying sensitive order fields via a trigger
CREATE OR REPLACE FUNCTION public.enforce_order_update_restrictions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_assigned_manufacturer boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.manufacturers m
    WHERE m.user_id = auth.uid() AND m.id = NEW.manufacturer_id
  ) INTO is_assigned_manufacturer;

  IF is_assigned_manufacturer THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
     OR NEW.delivery_status IS DISTINCT FROM OLD.delivery_status
     OR NEW.tracking_number IS DISTINCT FROM OLD.tracking_number
     OR NEW.manufacturer_id IS DISTINCT FROM OLD.manufacturer_id
     OR NEW.base_price_cents IS DISTINCT FROM OLD.base_price_cents
     OR NEW.printing_surcharge_cents IS DISTINCT FROM OLD.printing_surcharge_cents
     OR NEW.quantity_discount_cents IS DISTINCT FROM OLD.quantity_discount_cents
     OR NEW.design_coverage_adjustment_cents IS DISTINCT FROM OLD.design_coverage_adjustment_cents
     OR NEW.subtotal_cents IS DISTINCT FROM OLD.subtotal_cents
     OR NEW.tax_cents IS DISTINCT FROM OLD.tax_cents
     OR NEW.shipping_cents IS DISTINCT FROM OLD.shipping_cents
     OR NEW.shipping_final_cents IS DISTINCT FROM OLD.shipping_final_cents
     OR NEW.total_cents IS DISTINCT FROM OLD.total_cents
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id
     OR NEW.pricing_breakdown IS DISTINCT FROM OLD.pricing_breakdown
     OR NEW.printing_method IS DISTINCT FROM OLD.printing_method
  THEN
    RAISE EXCEPTION 'Customers cannot modify pricing, payment, status, or fulfillment fields';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_order_update_restrictions() FROM anon, authenticated;

DROP TRIGGER IF EXISTS enforce_order_update_restrictions_trigger ON public.orders;
CREATE TRIGGER enforce_order_update_restrictions_trigger
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_order_update_restrictions();
