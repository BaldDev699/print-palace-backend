import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManufacturer, setIsManufacturer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (authLoading) return;
      if (!user) {
        setIsAdmin(false);
        setIsManufacturer(false);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      if (!error && data) {
        setIsAdmin(data.some((r: any) => r.role === "admin"));
        setIsManufacturer(data.some((r: any) => r.role === "manufacturer"));
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin, isManufacturer, loading };
}
