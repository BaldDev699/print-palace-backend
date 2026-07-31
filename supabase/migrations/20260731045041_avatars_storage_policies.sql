-- avatars bucket: public read (bucket itself must be marked "Public" in the
-- Supabase dashboard - that bypasses RLS for SELECT), owners manage their
-- own files under a {user_id}/ folder, same pattern as
-- manufacturer-portfolio.
CREATE POLICY "Owners can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
