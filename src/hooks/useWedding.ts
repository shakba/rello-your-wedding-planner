import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wedding } from "@/types/wedding";

export const useWedding = (userId?: string) => {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWedding = useCallback(async () => {
    if (!userId) {
      setWedding(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("weddings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("loadWedding error:", error);
      setWedding(null);
    } else {
      setWedding(data ?? null);
    }

    setLoading(false);
  }, [userId]);

  const ensureWedding = useCallback(async () => {
    if (!userId) return null;
    if (wedding) return wedding;

    const { data, error } = await supabase
      .from("weddings")
      .insert({ user_id: userId, partner1_name: "", partner2_name: "" })
      .select("*")
      .single();

    if (error) {
      console.error("ensureWedding error:", error);
      return null;
    }

    setWedding(data);
    return data;
  }, [userId, wedding]);

  useEffect(() => {
    void loadWedding();
  }, [loadWedding]);

  return {
    wedding,
    setWedding,
    loading,
    reload: loadWedding,
    ensureWedding,
  };
};
