import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HomepageCounter {
  id: string;
  value: number;
  suffix: string;
  label: string;
  icon_name: string | null;
  sort_order: number;
  is_active: boolean;
  auto_sync_table: string | null;
}

export function useHomepageCounters() {
  const { data: counters = [], ...rest } = useQuery({
    queryKey: ["homepage-counters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_counters" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data as unknown as HomepageCounter[]) ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // For auto-sync counters, fetch the real count
  const { data: refereesCount } = useQuery({
    queryKey: ["referees-active-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("referees")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      return count ?? 0;
    },
    staleTime: 5 * 60 * 1000,
    enabled: counters.some(c => c.auto_sync_table === "referees"),
  });

  // Replace auto-synced values
  const resolved = counters.map(c => {
    if (c.auto_sync_table === "referees" && refereesCount !== undefined) {
      return { ...c, value: refereesCount };
    }
    return c;
  });

  return { data: resolved, ...rest };
}
