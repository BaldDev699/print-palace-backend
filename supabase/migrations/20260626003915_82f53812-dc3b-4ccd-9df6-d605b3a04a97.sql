-- profiles: restrict reads to own profile (was public, exposed emails)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- manufacturers: restrict reads (incl. contact info) to authenticated users
DROP POLICY IF EXISTS "Anyone can view manufacturers" ON public.manufacturers;
CREATE POLICY "Authenticated users can view manufacturers"
ON public.manufacturers
FOR SELECT
TO authenticated
USING (true);

-- roge_transactions: remove user self-insert (prevent fabricated financial records)
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.roge_transactions;

-- balance functions: not callable by end users; only trusted server-side (service_role)
REVOKE EXECUTE ON FUNCTION public.get_user_roge_balance(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_pending_withdrawals(uuid) FROM PUBLIC, anon, authenticated;