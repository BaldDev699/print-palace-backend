
-- 1. Allow system-owned manufacturer rows (user_id nullable) for Roge Production
ALTER TABLE public.manufacturers ALTER COLUMN user_id DROP NOT NULL;

-- 2. Seed Roge Production as verified system manufacturer (idempotent)
INSERT INTO public.manufacturers (
  user_id, company_name, contact_email, contact_phone, address,
  description, specialties, minimum_order_quantity, lead_time_days,
  certifications, website_url, is_verified
)
SELECT
  NULL,
  'Roge Production',
  'production@roge.app',
  NULL,
  'Nairobi, Kenya',
  'Roge''s in-house production team — custom apparel, printing, embroidery, and finishing.',
  ARRAY['DTG Printing','Screen Printing','Embroidery','Custom Apparel','Sublimation'],
  1,
  7,
  NULL,
  NULL,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.manufacturers WHERE company_name = 'Roge Production'
);

-- 3. Promote the specified user to admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE lower(email) = lower('methusellanyongesa057@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Admin RLS policies

-- Admins can view all manufacturers
DROP POLICY IF EXISTS "Admins can view all manufacturers" ON public.manufacturers;
CREATE POLICY "Admins can view all manufacturers"
ON public.manufacturers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any manufacturer (verify, edit)
DROP POLICY IF EXISTS "Admins can update any manufacturer" ON public.manufacturers;
CREATE POLICY "Admins can update any manufacturer"
ON public.manufacturers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Allow admins to bypass the customer update-field restriction trigger
CREATE OR REPLACE FUNCTION public.enforce_order_update_restrictions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  is_assigned_manufacturer boolean;
BEGIN
  -- Admins can update anything
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

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
$function$;

-- 6. Give admins access to admin-only helper: list all users for role management
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(user_id uuid, email text, display_name text, created_at timestamptz, is_admin boolean, is_manufacturer boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.email,
    p.display_name,
    p.created_at,
    public.has_role(p.id, 'admin'),
    public.has_role(p.id, 'manufacturer')
  FROM public.profiles p
  WHERE public.has_role(auth.uid(), 'admin');
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
