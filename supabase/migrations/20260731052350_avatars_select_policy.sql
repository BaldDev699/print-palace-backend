-- Missing from the original avatars bucket migration: a SELECT policy for
-- authenticated users. Uploading with { upsert: true } appears to require
-- checking object existence first, which needs its own SELECT permission -
-- without this, uploads failed with "new row violates row-level security
-- policy" even though the INSERT policy itself was correct.
CREATE POLICY "Authenticated can view avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');
