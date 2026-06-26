DROP VIEW IF EXISTS public.manufacturers_public;

CREATE OR REPLACE FUNCTION public.get_public_manufacturers()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  company_name text,
  description text,
  is_verified boolean,
  lead_time_days integer,
  minimum_order_quantity integer,
  specialties text[],
  certifications text[],
  website_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

GRANT EXECUTE ON FUNCTION public.get_public_manufacturers() TO authenticated, anon;