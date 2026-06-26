-- 1. Replace the overly-permissive SELECT policy on manufacturers
DROP POLICY IF EXISTS "Authenticated users can view manufacturers" ON public.manufacturers;

CREATE POLICY "Owners and order counterparties can view manufacturers"
ON public.manufacturers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.manufacturer_id = manufacturers.id
      AND o.customer_id = auth.uid()
  )
);

-- 2. Public, non-sensitive listing view (no contact_email/contact_phone/address)
CREATE OR REPLACE VIEW public.manufacturers_public
WITH (security_invoker = false) AS
SELECT
  id,
  user_id,
  company_name,
  description,
  is_verified,
  lead_time_days,
  minimum_order_quantity,
  specialties,
  certifications,
  website_url,
  created_at,
  updated_at
FROM public.manufacturers;

GRANT SELECT ON public.manufacturers_public TO authenticated, anon;