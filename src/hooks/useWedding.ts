import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wedding } from "@/types/wedding";

const scoreWedding = (w: Wedding) => {
  let score = 0;
  if (w.website_published) score += 1000;
  if (w.website_slug) score += 400;
  if ((w.gallery_urls?.length ?? 0) > 0) score += 250;
  if (w.partner1_name?.trim()) score += 120;
  if (w.partner2_name?.trim()) score += 120;
  if (w.story?.trim()) score += 80;
  if (w.venue_name?.trim()) score += 60;
  if (w.wedding_date) score += 60;
  return score;
};

const pickPrimaryWedding = (rows: Wedding[]) => {
  if (rows.length === 0) return null;

  return rows.reduce((best, current) => {
    const bestScore = scoreWedding(best);
    const currentScore = scoreWedding(current);
    if (currentScore > bestScore) return current;
    if (currentScore < bestScore) return best;

    const bestUpdated = new Date(best.updated_at).getTime();
    const currentUpdated = new Date(current.updated_at).getTime();
    return currentUpdated > bestUpdated ? current : best;
  });
};

export const useWedding = (userId?: string) => {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const ensurePromiseRef = useRef<Promise<Wedding | null> | null>(null);

  const fetchPrimaryWedding = useCallback(async () => {
    if (!userId) return { data: null as Wedding | null, error: null };

    const { data, error } = await supabase
      .from("weddings")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(200);

    if (error) return { data: null as Wedding | null, error };
    return { data: pickPrimaryWedding(data ?? []), error: null };
  }, [userId]);

  const loadWedding = useCallback(async () => {
    if (!userId) {
      setWedding(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await fetchPrimaryWedding();
      if (error) {
        console.error("loadWedding error:", error);
        setWedding(null);
      } else {
        setWedding(data ?? null);
      }
    } catch (error) {
      console.error("loadWedding unexpected error:", error);
      setWedding(null);
    } finally {
      setLoading(false);
    }
  }, [fetchPrimaryWedding, userId]);

  const ensureWedding = useCallback(async () => {
    if (!userId) return null;
    if (wedding) return wedding;
    if (ensurePromiseRef.current) return ensurePromiseRef.current;

    const promise = (async () => {
      try {
        const { data: existing, error: existingError } = await fetchPrimaryWedding();
        if (existingError) {
          console.error("ensureWedding fetch error:", existingError);
          return null;
        }

        if (existing) {
          setWedding(existing);
          return existing;
        }

        const { data, error } = await supabase
          .from("weddings")
          .insert({ user_id: userId, partner1_name: "", partner2_name: "" })
          .select("*")
          .single();

        if (error) {
          console.error("ensureWedding insert error:", error);
          return null;
        }

        setWedding(data);
        return data;
      } catch (error) {
        console.error("ensureWedding unexpected error:", error);
        return null;
      } finally {
        ensurePromiseRef.current = null;
      }
    })();

    ensurePromiseRef.current = promise;
    return promise;
  }, [fetchPrimaryWedding, userId, wedding]);

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
