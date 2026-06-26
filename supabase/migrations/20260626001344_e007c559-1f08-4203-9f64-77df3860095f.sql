
-- Trigger-only functions: not meant to be called directly by anyone
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Helper/RPC functions: keep callable by signed-in users only, never anon
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.get_user_roge_balance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_roge_balance(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_pending_withdrawals(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_pending_withdrawals(uuid) TO authenticated;
