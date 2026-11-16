import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useDrafts } from "@/hooks/useDrafts";
import { isMissingVisibilityColumn, withVisibilityFallback } from "@/lib/visibility";
import type { RoastVisibility } from "@/types/roast-session.types";

export type MyRoastRow = Pick<
  Tables<"roast_profiles">,
  | "id"
  | "beans_name"
  | "origin"
  | "farm_name"
  | "roast_process"
  | "initial_weight"
  | "final_weight"
  | "duration_seconds"
  | "crack_events"
  | "milestones"
  | "roaster_settings"
  | "roaster_type"
  | "temperature_unit"
  | "created_at"
  | "cupping_score"
  | "cupping_date"
  | "development_stats"
  | "environmental_notes"
  | "notes"
  | "roaster_data"
  | "temperature_data"
> & {
  /** Missing until the visibility migration has run (treat as public). */
  visibility?: string | null;
};

const COLUMNS =
  "id, beans_name, origin, farm_name, roast_process, initial_weight, final_weight, duration_seconds, crack_events, milestones, roaster_settings, roaster_type, temperature_unit, created_at, cupping_score, cupping_date, development_stats, environmental_notes, notes, roaster_data, temperature_data";

export interface UseMyRoasts {
  rows: MyRoastRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** Deletes the row in the account. Resolves false on failure (caller shows a toast). */
  remove: (id: string) => Promise<boolean>;
  /** Changes who can see a roast. Resolves an error message on failure. */
  setVisibility: (id: string, visibility: RoastVisibility) => Promise<{ ok: true } | { ok: false; error: string }>;
}

/** The signed-in user's saved roasts, newest first. Empty and idle when signed out. */
export function useMyRoasts(userId: string | null | undefined): UseMyRoasts {
  const [rows, setRows] = useState<MyRoastRow[]>([]);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await withVisibilityFallback("useMyRoasts", (hasColumn) =>
      supabase
        .from("roast_profiles")
        .select(hasColumn ? `${COLUMNS}, visibility` : COLUMNS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    );
    if (err) {
      setError(err.message);
    } else {
      setError(null);
      setRows((data ?? []) as unknown as MyRoastRow[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // A draft reaching the account (Save, or the sign-in sync) should show up here.
  useEffect(() => {
    if (!userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onChange = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void refresh(), 600);
    };
    window.addEventListener("roast-drafts-changed", onChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("roast-drafts-changed", onChange);
    };
  }, [userId, refresh]);

  const remove = useCallback(
    async (id: string) => {
      if (!userId) return false;
      const { error: err } = await supabase.from("roast_profiles").delete().eq("id", id).eq("user_id", userId);
      if (err) return false;
      setRows((prev) => prev.filter((r) => r.id !== id));
      return true;
    },
    [userId],
  );

  const setVisibility = useCallback(
    async (id: string, visibility: RoastVisibility) => {
      if (!userId) return { ok: false as const, error: "Sign in to change who can see this roast." };
      const { error: err } = await supabase
        .from("roast_profiles")
        .update({ visibility })
        .eq("id", id)
        .eq("user_id", userId);
      if (err) {
        return {
          ok: false as const,
          error: isMissingVisibilityColumn(err) ? "Visibility settings are not available yet." : "Check your connection and try again.",
        };
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, visibility } : r)));
      return { ok: true as const };
    },
    [userId],
  );

  return { rows, loading, error, refresh, remove, setVisibility };
}

/** Distinct bean names from the account (when signed in) and this device, for autocomplete. */
export function useBeanNames(userId: string | null | undefined): string[] {
  const drafts = useDrafts();
  const [remote, setRemote] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) {
      setRemote([]);
      return;
    }
    let cancelled = false;
    supabase
      .from("roast_profiles")
      .select("beans_name")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(300)
      .then(({ data }) => {
        if (!cancelled && data) setRemote(data.map((r) => r.beans_name));
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return useMemo(() => {
    const seen = new Map<string, string>();
    for (const name of [...drafts.map((d) => d.details.beanName ?? ""), ...remote]) {
      const trimmed = name.trim();
      const key = trimmed.toLowerCase();
      if (trimmed && !seen.has(key) && trimmed !== "Unnamed bean") seen.set(key, trimmed);
    }
    return [...seen.values()];
  }, [drafts, remote]);
}
