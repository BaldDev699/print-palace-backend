import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const awardSchema = z.object({
  user_id: z.string().uuid(),
  transaction_type: z.enum(["earned", "bonus", "referral"]),
  amount: z.number().positive().max(1_000_000),
  description: z.string().max(500).optional(),
  reference_id: z.string().uuid().optional(),
});

// Awards Roge coins to a user. Requires an authenticated caller; uses the
// admin client so it can credit other users (e.g. design-usage rewards),
// which user-scoped RLS would otherwise block.
export const awardRogeCoinsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => awardSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: transaction, error } = await supabaseAdmin
      .from("roge_transactions")
      .insert({
        user_id: data.user_id,
        transaction_type: data.transaction_type,
        amount: data.amount,
        description: data.description ?? `${data.transaction_type} reward`,
        reference_id: data.reference_id ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const { data: balance } = await supabaseAdmin.rpc("get_user_roge_balance", {
      user_uuid: data.user_id,
    });

    return { transaction, new_balance: balance ?? 0 };
  });
