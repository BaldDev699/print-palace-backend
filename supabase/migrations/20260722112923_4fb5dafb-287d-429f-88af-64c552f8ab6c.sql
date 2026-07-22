
-- RLS policies for order-assets bucket
-- Path convention: {order_id}/{filename}

CREATE POLICY "Customers can read own order assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-assets'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id::text = (storage.foldername(name))[1]
      AND o.customer_id = auth.uid()
  )
);

CREATE POLICY "Assigned manufacturer can read order assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-assets'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.manufacturers m ON m.id = o.manufacturer_id
    WHERE o.id::text = (storage.foldername(name))[1]
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Customers can upload assets to own orders"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'order-assets'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id::text = (storage.foldername(name))[1]
      AND o.customer_id = auth.uid()
  )
);

CREATE POLICY "Assigned manufacturer can upload order assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'order-assets'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.manufacturers m ON m.id = o.manufacturer_id
    WHERE o.id::text = (storage.foldername(name))[1]
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "Customers can delete own order assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'order-assets'
  AND owner = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id::text = (storage.foldername(name))[1]
      AND o.customer_id = auth.uid()
  )
);

CREATE POLICY "Assigned manufacturer can delete their uploaded order assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'order-assets'
  AND owner = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.manufacturers m ON m.id = o.manufacturer_id
    WHERE o.id::text = (storage.foldername(name))[1]
      AND m.user_id = auth.uid()
  )
);
