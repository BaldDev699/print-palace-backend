
-- designs bucket: private, per-user folder
CREATE POLICY "Users manage their own design files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- manufacturer-portfolio bucket
CREATE POLICY "Authenticated can view portfolio images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'manufacturer-portfolio');

CREATE POLICY "Owners can upload portfolio images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'manufacturer-portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can update portfolio images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'manufacturer-portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can delete portfolio images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'manufacturer-portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);
