import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Returns the authenticated caller's Roge balance. The underlying SECURITY
// DEFINER functions are no longer executable by end users, so we run them
// server-side with the service role, scoped strictly to the verified userId.
export const getRogeBalanceFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: totalData, error: totalError } = await supabaseAdmin.rpc(
      "get_user_roge_balance",
      { user_uuid: userId },
    );
    if (totalError) throw new Error(totalError.message);

    const { data: pendingData, error: pendingError } = await supabaseAdmin.rpc(
      "get_pending_withdrawals",
      { user_uuid: userId },
    );
    if (pendingError) throw new Error(pendingError.message);

    const totalBalance = Number(totalData ?? 0);
    const pendingWithdrawals = Number(pendingData ?? 0);
    const availableBalance = Math.max(0, totalBalance - pendingWithdrawals);

    return { totalBalance, pendingWithdrawals, availableBalance };
  });
